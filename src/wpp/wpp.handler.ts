import * as wppconnect from '@wppconnect-team/wppconnect';
import fs from 'fs';
import path from 'path';
import { WppClient } from './wpp.client';
import { ChatService } from '../services/chat.service';
import { config } from '../config';
import { logger } from '../utils/logger';

const chatService = new ChatService();

export const handleIncomingMessage = async (message: wppconnect.Message): Promise<void> => {
  try {
    // 1. Ignore group chats - only automate 1-on-1 private conversations
    if (message.isGroupMsg) {
      logger.debug(`Ignoring message ${message.id} because it belongs to a group chat`);
      return;
    }

    // Ignore offline/older messages synced upon client login (older than 60 seconds)
    const messageTimestamp = message.timestamp * 1000;
    const timeDifference = Date.now() - messageTimestamp;
    if (timeDifference > 60000) {
      logger.info(`Ignoring older message ${message.id} from ${message.from} (sent ${Math.round(timeDifference / 1000)}s ago)`);
      return;
    }

    const originalChatId = message.from;
    let chatId = message.from;
    const messageId = message.id;
    const type = message.type;
    const contactName = message.sender?.pushname || message.sender?.name || '';

    // Resolve LID (Line ID) JIDs to standard phone number JIDs (@c.us) if possible
    if (chatId.endsWith('@lid')) {
      try {
        const wppClient = WppClient.getInstance().getClient();
        if (wppClient) {
          let pnEntry: any = null;
          if (typeof (wppClient as any).getPnLidEntry === 'function') {
            pnEntry = await (wppClient as any).getPnLidEntry(chatId);
          } else if ((wppClient as any).contact && typeof (wppClient as any).contact.getPnLidEntry === 'function') {
            pnEntry = await (wppClient as any).contact.getPnLidEntry(chatId);
          }

          if (pnEntry && pnEntry.phoneNumber && pnEntry.phoneNumber._serialized) {
            logger.info(`Resolved LID [${chatId}] to phone JID [${pnEntry.phoneNumber._serialized}]`);
            chatId = pnEntry.phoneNumber._serialized;
          }
        }
      } catch (err: any) {
        logger.warn(`Could not resolve phone number for LID [${chatId}]: ${err.message}`);
      }
    }
    
    let body = message.body || message.caption || '';
    let mediaDetails: any = {};

    logger.info(`Received WhatsApp message of type [${type}] from [${chatId}] (${contactName})`);

    // 2. Handle Media Decryption and Storage if the message has media
    const isMedia = message.isMedia || message.isMMS || ['image', 'video', 'document', 'audio', 'ptt'].includes(type);

    if (isMedia) {
      const clientWrapper = WppClient.getInstance();
      const wppClient = clientWrapper.getClient();

      if (wppClient) {
        try {
          logger.info(`Decrypting media message ${messageId} of type ${type}`);
          const buffer = await wppClient.decryptFile(message);
          
          // Generate unique file path inside config.uploadDir/inbound
          const inboundDir = path.join(config.uploadDir, 'inbound');
          if (!fs.existsSync(inboundDir)) {
            fs.mkdirSync(inboundDir, { recursive: true });
          }

          const fileExtension = message.mimetype ? message.mimetype.split('/')[1]?.split(';')[0] || '' : '';
          const cleanExtension = fileExtension === 'jpeg' ? 'jpg' : fileExtension;
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          
          // Extract or construct file name
          const originalName = (message as any).filename || `media_${timestamp}_${randomSuffix}.${cleanExtension || 'bin'}`;
          const finalFileName = `${timestamp}_${randomSuffix}_${originalName}`;
          const savePath = path.join(inboundDir, finalFileName);

          fs.writeFileSync(savePath, buffer);
          logger.info(`Media saved successfully to: ${savePath}`);

          // Set media details for database insertion
          mediaDetails.mediaPath = savePath;
          mediaDetails.mimeType = message.mimetype;
          mediaDetails.fileName = originalName;
          
          // Use filename/caption context for the AI
          if (!body) {
            body = `[Sent file: ${originalName}]`;
          }
        } catch (mediaError) {
          logger.error(`Error decrypting/saving media for message ${messageId}:`, mediaError);
          // Don't crash; let the message proceed as a text summary
          if (!body) {
            body = `[Sent media of type ${type} - extraction failed]`;
          }
        }
      }
    }

    // 3. Handle Location Message
    if (type === 'location') {
      const lat = (message as any).lat || (message as any).latitude;
      const lng = (message as any).lng || (message as any).longitude;
      const locTitle = (message as any).loc || message.body || 'Location';
      
      mediaDetails.latitude = lat ? String(lat) : undefined;
      mediaDetails.longitude = lng ? String(lng) : undefined;
      mediaDetails.locationTitle = locTitle;
      
      body = `[Sent location: ${locTitle} (Lat: ${lat}, Lng: ${lng})]`;
    }

    // 4. Handle Contact Card (VCard) Message
    if (type === 'vcard' || type === 'multi_vcard') {
      mediaDetails.vcardData = message.body || '';
      body = `[Sent contact card(s): ${message.body ? message.body.substring(0, 100) : ''}]`;
    }

    // Start composing/typing status immediately to simulate human reading/typing
    const clientWrapper = WppClient.getInstance();
    const client = clientWrapper.getClient();
    if (client) {
      client.startTyping(originalChatId).catch((e: any) => logger.debug(`Failed to start typing: ${e.message}`));
    }

    // 5. Process through ChatService (Saves conversation, queries AI, captures leads if needed)
    const replyText = await chatService.processIncomingMessage(
      chatId,
      messageId,
      body,
      type,
      contactName,
      mediaDetails,
      originalChatId
    );

    // 6. Send the generated response back via WhatsApp
    if (clientWrapper.isConnected() && replyText) {
      if (client) {
        // Stop typing composing status
        client.stopTyping(originalChatId).catch(() => {});
        
        logger.info(`Sending AI reply to active thread: ${originalChatId}`);
        await client.sendText(originalChatId, replyText);
      } else {
        logger.warn(`Could not send reply: WhatsApp client not active for session.`);
      }
    } else {
      logger.warn(`Could not send reply: client not connected or reply text is empty.`);
    }
  } catch (error) {
    logger.error('Error handling incoming WhatsApp message:', error);
  }
};
