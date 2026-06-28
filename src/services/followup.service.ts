import { Lead } from '../models/lead.model';
import { Conversation, Message } from '../models/conversation.model';
import { WppClient } from '../wpp/wpp.client';
import { Cerebras } from '@cerebras/cerebras_cloud_sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import ChatService from './chat.service';

export class FollowUpService {
  private client: Cerebras;
  private chatService: ChatService;

  constructor() {
    this.client = new Cerebras({
      apiKey: config.cerebrasApiKey,
    });
    this.chatService = new ChatService();
  }

  public async scanAndSendFollowUps(): Promise<void> {
    try {
      // Find all leads that are pending follow-up
      const pendingLeads = await Lead.find({ followUpStatus: 'pending' });
      if (pendingLeads.length === 0) return;

      const delayMinutes = config.followUpDelayMinutes;
      const now = new Date();

      for (const lead of pendingLeads) {
        const chatId = lead.sourceConversation;

        // 1. Get the conversation
        const conversation = await Conversation.findOne({ chatId });
        if (!conversation) continue;

        // 2. Get the last message in this conversation
        const lastMessage = await Message.findOne({ chatId }).sort({ timestamp: -1 });
        if (!lastMessage) continue;

        // If the last message was from the user, it means they replied!
        // We should skip follow-up and mark status as 'skipped'
        if (lastMessage.role === 'user') {
          logger.info(`Lead ${lead.phone} has replied since our last message. Skipping follow-up.`);
          lead.followUpStatus = 'skipped';
          await lead.save();
          continue;
        }

        // If the last message was assistant, calculate the elapsed silent time
        const elapsedMs = now.getTime() - lastMessage.timestamp.getTime();
        const elapsedMinutes = elapsedMs / 60000;

        if (elapsedMinutes >= delayMinutes) {
          logger.info(`Lead ${lead.phone} has been silent for ${elapsedMinutes.toFixed(1)} minutes. Triggering follow-up.`);
          
          try {
            // Generate follow-up prompt
            const requirements = lead.requirements || 'our services';
            const name = lead.name || 'there';

            const prompt = `You are a warm, friendly advisor from ${config.businessName}.
We spoke recently with a client named "${name}" who was interested in: "${requirements}".
The client has gone quiet. Draft an ultra-brief, friendly, non-spammy check-in message (1-2 sentences max) asking if they have any other questions or if they are ready to proceed. 
Do not answer questions or list pricing. Just check in naturally. Do not start with hello/hi if it sounds robotic, sound like a human sending a WhatsApp text.
Response format must be raw text containing only the message.`;

            const completion = (await this.client.chat.completions.create({
              model: config.cerebrasModel,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
            })) as any;

            const followUpText = completion.choices[0]?.message?.content?.trim() || '';
            if (!followUpText) {
              throw new Error('Cerebras returned empty content for follow-up.');
            }

            // Send follow-up over WhatsApp
            const wppClientWrapper = WppClient.getInstance();
            if (wppClientWrapper.isConnected()) {
              const client = wppClientWrapper.getClient();
              if (client) {
                logger.info(`Sending follow-up WhatsApp message to ${chatId}`);
                await client.sendText(chatId, followUpText);

                // Save follow-up message to DB
                const replyMessageId = `followup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                await this.chatService.saveMessage(chatId, replyMessageId, 'assistant', followUpText, 'chat');

                // Update lead follow-up status to 'sent'
                lead.followUpStatus = 'sent';
                await lead.save();
              }
            }
          } catch (err: any) {
            logger.error(`Failed to process follow-up for lead ${lead.phone}:`, err);
          }
        }
      }
    } catch (error) {
      logger.error('Error scanning follow-ups:', error);
    }
  }

  public startScheduler(): void {
    logger.info(`Initializing Follow-up Scheduler (Interval: 60s, Delay: ${config.followUpDelayMinutes}m)`);
    // Run scanner every 60 seconds
    setInterval(async () => {
      await this.scanAndSendFollowUps();
    }, 60000);
  }
}
