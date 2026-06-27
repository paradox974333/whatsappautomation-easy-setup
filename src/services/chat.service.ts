import fs from 'fs';
import { Conversation, Message, IMessage } from '../models/conversation.model';
import { LeadService } from './lead.service';
import { AIProvider, AIChatResponse } from '../ai/ai.provider';
import { CerebrasProvider } from '../ai/cerebras.provider';
import { PromptManager } from '../ai/prompt.manager';
import { logger } from '../utils/logger';
import { config } from '../config';
import { WppClient } from '../wpp/wpp.client';

export class ChatService {
  private aiProvider: AIProvider;
  private leadService: LeadService;

  constructor() {
    // AI Provider can be configured dynamically to support other providers later
    this.aiProvider = new CerebrasProvider();
    this.leadService = new LeadService();
  }

  public async saveMessage(
    chatId: string,
    messageId: string,
    role: 'user' | 'assistant',
    body: string,
    type: string = 'chat',
    mediaDetails?: {
      mediaPath?: string;
      mimeType?: string;
      fileName?: string;
      latitude?: string;
      longitude?: string;
      locationTitle?: string;
      vcardData?: string;
    }
  ): Promise<IMessage> {
    try {
      // 1. Create or update the conversation
      await Conversation.findOneAndUpdate(
        { chatId },
        {
          $set: { lastMessageAt: new Date() },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true, new: true }
      );

      // 2. Save the message to DB
      const newMessage = new Message({
        chatId,
        messageId,
        role,
        body,
        type,
        timestamp: new Date(),
        ...mediaDetails,
      });

      return await newMessage.save();
    } catch (error) {
      logger.error(`Error saving message for chatId ${chatId}:`, error);
      throw error;
    }
  }

  public async getConversationHistory(chatId: string, limit: number = 15): Promise<IMessage[]> {
    return Message.find({ chatId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .then((msgs) => msgs.reverse());
  }

  public async getRecentChats(): Promise<any[]> {
    return Conversation.find().sort({ lastMessageAt: -1 });
  }

  public async processIncomingMessage(
    chatId: string,
    messageId: string,
    body: string,
    type: string = 'chat',
    contactName?: string,
    mediaDetails?: {
      mediaPath?: string;
      mimeType?: string;
      fileName?: string;
      latitude?: string;
      longitude?: string;
      locationTitle?: string;
      vcardData?: string;
    },
    originalChatId?: string
  ): Promise<string> {
    try {
      // 1. Log and save the incoming message
      let formattedBody = body;
      if (type !== 'chat') {
        formattedBody = `[Sent message of type: ${type}${body ? ` with caption/body: "${body}"` : ''}]`;
      }

      await this.saveMessage(chatId, messageId, 'user', formattedBody, type, mediaDetails);

      if (contactName) {
        await Conversation.findOneAndUpdate({ chatId }, { contactName });
      }

      // Check if this is the start of the conversation (first message)
      const messageCount = await Message.countDocuments({ chatId });
      if (messageCount === 1) {
        logger.info(`First message detected for contact: ${chatId}. Scheduling welcome image...`);
        this.sendWelcomeImage(originalChatId || chatId, contactName || 'Client');
      }

      // 2. Retrieve history (limit 10 messages for prompt efficiency and context window)
      const rawHistory = await this.getConversationHistory(chatId, 10);
      
      // Map database messages to format expected by AIProvider
      const history = rawHistory
        // Exclude the message we just saved to send it separately as userMessage
        .filter((msg) => msg.messageId !== messageId)
        .map((msg) => ({
          role: msg.role,
          content: msg.body,
        }));

      // 3. Request AI Response
      const systemPrompt = PromptManager.getSystemPrompt();
      logger.info(`Processing message for contact: ${chatId} (${contactName || 'Unknown'})`);
      
      const aiResponse: AIChatResponse = await this.aiProvider.processChat(
        formattedBody,
        history,
        systemPrompt
      );

      // Handle meeting booking confirmation
      let meetLink = '';
      if (aiResponse.bookingIntent && aiResponse.bookingDetails?.confirmed && aiResponse.bookingDetails.date && aiResponse.bookingDetails.time) {
        meetLink = config.meetingLink || 'https://meet.google.com/socialbuzzz-consult';
        
        // Append confirmation text to response
        aiResponse.response += `\n\n📅 *Meeting Confirmed!*\n• *Date*: ${aiResponse.bookingDetails.date}\n• *Time*: ${aiResponse.bookingDetails.time}\n• *Google Meet Link*: ${meetLink}\n\nWe look forward to speaking with you!`;
        
        // Trigger background booking actions (notifications, flyer sending)
        this.triggerBookingActions(chatId, originalChatId || chatId, contactName || 'Client', aiResponse, meetLink);
      }

      // 4. Handle Lead Extraction if purchase intent is flagged
      if (aiResponse.purchaseIntent) {
        logger.info(`Purchase intent detected for user: ${chatId}. Triggering lead capture.`);
        
        const extractedLead = aiResponse.leadDetails || {};
        
        // Clean phone number format if extracting, or fall back to chatId sender phone
        const rawPhone = extractedLead.phone || chatId.split('@')[0];
        
        await this.leadService.createOrUpdateLead(rawPhone, {
          name: extractedLead.name || contactName,
          business: extractedLead.business,
          email: extractedLead.email,
          requirements: extractedLead.requirements || formattedBody,
          sourceConversation: chatId,
        });
      }

      // 5. Save the generated reply as 'assistant' to conversation
      const replyMessageId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await this.saveMessage(chatId, replyMessageId, 'assistant', aiResponse.response, 'chat');

      return aiResponse.response;
    } catch (error) {
      logger.error(`Error in processIncomingMessage for ${chatId}:`, error);
      return "I'm sorry, I couldn't process your request. A team member will get back to you soon.";
    }
  }

  private async triggerBookingActions(
    chatId: string,
    originalChatId: string,
    contactName: string,
    aiResponse: AIChatResponse,
    meetLink: string
  ): Promise<void> {
    try {
      // Delay slightly to let the client receive the text response first
      await new Promise(resolve => setTimeout(resolve, 2000));

      const clientWrapper = WppClient.getInstance();
      const client = clientWrapper.getClient();
      if (!client) {
        logger.warn('WhatsApp client not ready; skipping booking actions.');
        return;
      }

      const date = aiResponse.bookingDetails?.date || 'Tomorrow';
      const time = aiResponse.bookingDetails?.time || 'Confirmed Time';
      const requirements = aiResponse.leadDetails?.requirements || 'Digital growth services';

      // 1. Notify Owner (Sachin Kadli)
      const rawOwnerPhone = config.ownerPhoneNumber || '919900239806';
      const ownerJid = rawOwnerPhone.endsWith('@c.us') ? rawOwnerPhone : `${rawOwnerPhone.replace(/\D/g, '')}@c.us`;
      
      const ownerMessage = `🔔 *New Meeting Confirmed!*\n\n` +
        `• *Client*: ${contactName} (${chatId.split('@')[0]})\n` +
        `• *Date*: ${date}\n` +
        `• *Time*: ${time}\n` +
        `• *Meet Link*: ${meetLink}\n` +
        `• *Needs*: ${requirements}`;
        
      logger.info(`Sending meeting notification to owner: ${ownerJid}`);
      await client.sendText(ownerJid, ownerMessage);

      // 2. Deliver Welcome Flyer Image to Client
      const flyerPath = '/app/assets/welcome_flyer.png';
      if (fs.existsSync(flyerPath)) {
        logger.info(`Sending welcome flyer to client: ${originalChatId}`);
        await client.sendImage(
          originalChatId,
          flyerPath,
          'welcome_flyer.png',
          `Hello ${contactName}! Here is the welcome flyer for SocialBuzzz18. See you at the meeting!`
        );
      } else {
        logger.warn(`Welcome flyer not found at ${flyerPath}; skipping delivery.`);
      }
    } catch (err: any) {
      logger.error('Error executing booking actions:', err);
    }
  }

  private async sendWelcomeImage(originalChatId: string, contactName: string): Promise<void> {
    try {
      // Delay slightly to let the client receive the text response first
      await new Promise(resolve => setTimeout(resolve, 3000));

      const clientWrapper = WppClient.getInstance();
      const client = clientWrapper.getClient();
      if (!client) {
        logger.warn('WhatsApp client not ready; skipping welcome image.');
        return;
      }

      const welcomePicPath = '/app/uploads/IMG_7199.PNG';
      if (fs.existsSync(welcomePicPath)) {
        logger.info(`Sending initial welcome image to client: ${originalChatId}`);
        await client.sendImage(
          originalChatId,
          welcomePicPath,
          'IMG_7199.PNG',
          `Welcome ${contactName} to SocialBuzzz18!`
        );
      } else {
        logger.warn(`Welcome picture not found at ${welcomePicPath}`);
      }
    } catch (err: any) {
      logger.error('Error sending welcome image:', err);
    }
  }
}
export default ChatService;
