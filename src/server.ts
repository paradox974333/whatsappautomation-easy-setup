import app from './app';
import { config } from './config';
import { connectDatabase } from './database';
import { WppClient } from './wpp/wpp.client';
import { handleIncomingMessage } from './wpp/wpp.handler';
import { logger } from './utils/logger';
import { FollowUpService } from './services/followup.service';

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDatabase();

    // 1b. Run quick backfill migration for messages
    try {
      const { Message } = require('./models/conversation.model');
      const unlinkedMsgs = await Message.find({ chatId: { $exists: false } });
      if (unlinkedMsgs.length > 0) {
        logger.info(`Found ${unlinkedMsgs.length} messages without chatId. Running JID extraction...`);
        let migratedCount = 0;
        
        // Phase 1: Extract JID from user message IDs
        for (const msg of unlinkedMsgs) {
          const parts = msg.messageId.split('_');
          if (parts.length >= 2 && (parts[1].endsWith('@c.us') || parts[1].endsWith('@lid') || parts[1].endsWith('@g.us'))) {
            msg.chatId = parts[1];
            await msg.save();
            migratedCount++;
          }
        }
        logger.info(`Phase 1 JID extraction completed. Restored ${migratedCount} messages.`);
        
        // Phase 2: Link reply messages to preceding user messages
        const remainingUnlinked = await Message.find({ chatId: { $exists: false } });
        if (remainingUnlinked.length > 0) {
          logger.info(`Linking ${remainingUnlinked.length} remaining reply messages...`);
          let linkedCount = 0;
          for (const msg of remainingUnlinked) {
            const precedingMsg = await Message.findOne({
              role: 'user',
              createdAt: { $lt: msg.createdAt },
              chatId: { $exists: true, $ne: null }
            }).sort({ createdAt: -1 });
            
            if (precedingMsg && precedingMsg.chatId) {
              msg.chatId = precedingMsg.chatId;
              await msg.save();
              linkedCount++;
            }
          }
          logger.info(`Phase 2 completed. Linked ${linkedCount} reply messages.`);
        }
      }
    } catch (err: any) {
      logger.warn(`Could not run backfill migration: ${err.message}`);
    }

    // 2. Start Express HTTP Server
    const server = app.listen(config.port, () => {
      logger.info(`==================================================`);
      logger.info(`  Server running in [${config.env}] mode`);
      logger.info(`  Local URL: http://localhost:${config.port}`);
      logger.info(`  QR Dashboard: http://localhost:${config.port}/`);
      logger.info(`==================================================`);
    });

    // 2b. Start background follow-up scheduler
    const followUpService = new FollowUpService();
    followUpService.startScheduler();

    // 3. Auto-initialize WPPConnect WhatsApp Client in the background
    logger.info('Auto-initializing WhatsApp automation client...');
    WppClient.getInstance()
      .initialize(handleIncomingMessage)
      .then(() => {
        logger.info('WhatsApp client auto-initialization sequence completed.');
      })
      .catch((err) => {
        logger.error('WhatsApp client auto-initialization failed:', err);
        logger.info('The platform remains online. You can re-initialize the session via the web dashboard.');
      });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.warn(`Received ${signal}. Shutting down gracefully...`);
      
      // Close WPPConnect session if running
      await WppClient.getInstance().disconnect();
      
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Critical failure during server startup:', error);
    process.exit(1);
  }
};

startServer();
