import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { ChatService } from '../services/chat.service';
import { WppClient } from '../wpp/wpp.client';
import { config } from '../config';
import { logger } from '../utils/logger';

const formatChatId = (phone: string): string => {
  if (phone.endsWith('@c.us') || phone.endsWith('@g.us') || phone.endsWith('@lid')) {
    return phone;
  }
  const cleaned = phone.replace(/\D/g, '');
  return `${cleaned}@c.us`;
};

export class ChatController {
  private chatService = new ChatService();

  public getChats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chats = await this.chatService.getRecentChats();
      res.json({
        success: true,
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  };

  public getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone } = req.params;
      const chatId = formatChatId(phone);
      const history = await this.chatService.getConversationHistory(chatId);
      
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };

  public sendManualMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone } = req.params;
      const { 
        messageType, // 'text' | 'image' | 'video' | 'pdf' | 'document' | 'vcard' | 'location'
        message, // text body or caption
        filename, // required for media files
        base64, // base64 string for files
        latitude, // required for location
        longitude, // required for location
        locationTitle, // location name
        contactPhone, // required for vcard
        contactName, // required for vcard
      } = req.body;

      const chatId = formatChatId(phone);
      const wppClientWrapper = WppClient.getInstance();

      if (!wppClientWrapper.isConnected()) {
        res.status(503).json({
          success: false,
          message: 'WhatsApp client is not connected. Scan QR code first.',
        });
        return;
      }

      const client = wppClientWrapper.getClient()!;
      let result: any;
      const mediaDetails: any = {};
      const replyMessageId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 1. Text Message
      if (!messageType || messageType === 'text') {
        if (!message) {
          res.status(400).json({ success: false, message: 'Message text is required' });
          return;
        }
        result = await client.sendText(chatId, message);
        await this.chatService.saveMessage(chatId, replyMessageId, 'assistant', message, 'chat');
      } 
      // 2. Media File (Image, Video, PDF, Document)
      else if (['image', 'video', 'pdf', 'document'].includes(messageType)) {
        if (!base64 || !filename) {
          res.status(400).json({ success: false, message: 'Base64 data and filename are required for media' });
          return;
        }

        // Clean Base64 format if it has data prefix
        const base64Content = base64.includes(';base64,') ? base64.split(';base64,')[1] : base64;
        const buffer = Buffer.from(base64Content, 'base64');
        
        // Save file to outbound uploads directory
        const outboundDir = path.join(config.uploadDir, 'outbound');
        if (!fs.existsSync(outboundDir)) {
          fs.mkdirSync(outboundDir, { recursive: true });
        }

        const timestamp = Date.now();
        const safeFileName = `${timestamp}_${filename.replace(/\s+/g, '_')}`;
        const savePath = path.join(outboundDir, safeFileName);
        
        fs.writeFileSync(savePath, buffer);
        logger.info(`Outbound media saved locally to: ${savePath}`);

        // Send file via WPPConnect (uses local path)
        result = await client.sendFile(chatId, savePath, {
          filename,
          caption: message || '',
        });

        // Set database fields
        mediaDetails.mediaPath = savePath;
        mediaDetails.fileName = filename;
        mediaDetails.mimeType = messageType === 'pdf' ? 'application/pdf' : `${messageType}/unknown`; // general fallback

        const displayBody = message ? `[Sent manual ${messageType}: ${filename} with caption: "${message}"]` : `[Sent manual ${messageType}: ${filename}]`;
        await this.chatService.saveMessage(chatId, replyMessageId, 'assistant', displayBody, messageType, mediaDetails);
      } 
      // 3. Location Message
      else if (messageType === 'location') {
        if (!latitude || !longitude) {
          res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
          return;
        }
        
        const title = locationTitle || 'Location';
        result = await client.sendLocation(chatId, String(latitude), String(longitude), title);
        
        mediaDetails.latitude = String(latitude);
        mediaDetails.longitude = String(longitude);
        mediaDetails.locationTitle = title;

        const displayBody = `[Sent manual location: ${title} (Lat: ${latitude}, Lng: ${longitude})]`;
        await this.chatService.saveMessage(chatId, replyMessageId, 'assistant', displayBody, 'location', mediaDetails);
      } 
      // 4. Contact Card (vCard) Message
      else if (messageType === 'vcard') {
        if (!contactPhone || !contactName) {
          res.status(400).json({ success: false, message: 'contactPhone and contactName are required' });
          return;
        }
        
        const targetContactId = formatChatId(contactPhone);
        result = await client.sendContactVcard(chatId, targetContactId, contactName);
        
        mediaDetails.vcardData = targetContactId;
        const displayBody = `[Sent manual contact card: ${contactName} (${contactPhone})]`;
        await this.chatService.saveMessage(chatId, replyMessageId, 'assistant', displayBody, 'vcard', mediaDetails);
      } else {
        res.status(400).json({ success: false, message: 'Unsupported message type' });
        return;
      }

      res.json({
        success: true,
        message: 'Manual message sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default ChatController;
