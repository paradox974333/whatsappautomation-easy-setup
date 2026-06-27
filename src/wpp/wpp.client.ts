import * as wppconnect from '@wppconnect-team/wppconnect';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

export type WppSessionStatus = 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED';

export class WppClient {
  private static instance: WppClient;
  private client: wppconnect.Whatsapp | null = null;
  private qrCodeBase64: string | null = null;
  private qrCodeUrl: string | null = null;
  private status: WppSessionStatus = 'DISCONNECTED';
  private messageCallback: ((message: wppconnect.Message) => void) | null = null;
  private isDisconnecting = false;

  private constructor() {
    // Ensure tokens and uploads directory exist
    if (!fs.existsSync(config.tokenDir)) {
      fs.mkdirSync(config.tokenDir, { recursive: true });
    }
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
  }

  public static getInstance(): WppClient {
    if (!WppClient.instance) {
      WppClient.instance = new WppClient();
    }
    return WppClient.instance;
  }

  public getClient(): wppconnect.Whatsapp | null {
    return this.client;
  }

  public getQrCode(): { base64: string | null; url: string | null } {
    return {
      base64: this.qrCodeBase64,
      url: this.qrCodeUrl,
    };
  }

  public getStatus(): WppSessionStatus {
    return this.status;
  }

  public isConnected(): boolean {
    return this.status === 'CONNECTED' && this.client !== null;
  }

  public async initialize(onMessageCallback: (message: wppconnect.Message) => void): Promise<void> {
    if (this.status === 'CONNECTED' || this.status === 'INITIALIZING') {
      logger.info(`WPPConnect initialization skipped: current state is ${this.status}`);
      return;
    }

    this.messageCallback = onMessageCallback;
    this.status = 'INITIALIZING';
    this.qrCodeBase64 = null;
    this.qrCodeUrl = null;

    logger.info(`Starting WPPConnect session: ${config.wppSessionName}`);

    // Remove stale chromium lock files if present due to unclean shutdown
    const browserProfileDir = path.join(config.tokenDir, config.wppSessionName);
    const lockFiles = ['SingletonLock', 'lock'];
    for (const lockFile of lockFiles) {
      const lockPath = path.join(browserProfileDir, lockFile);
      try {
        fs.lstatSync(lockPath); // Will succeed even if it is a broken symlink
        fs.unlinkSync(lockPath);
        logger.info(`Removed stale Chromium lock file: ${lockPath}`);
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
          logger.warn(`Could not remove stale Chromium lock file at ${lockPath}: ${err.message}`);
        }
      }
    }

    try {
      this.client = await wppconnect.create({
        session: config.wppSessionName,
        tokenStore: 'file',
        folderNameToken: config.tokenDir,
        autoClose: 0, // Never automatically close the browser while waiting for QR scan
        catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
          this.status = 'QR_READY';
          this.qrCodeBase64 = base64Qrimg; // Already is data:image/png;base64,...
          this.qrCodeUrl = urlCode || null;
          logger.info(`QR Code attempt #${attempts} generated. Scan to authenticate.`);
          console.log(asciiQR); // Print ASCII QR to the container terminal
        },
        statusFind: (statusSession, session) => {
          logger.info(`Session status event: ${statusSession} for session: ${session}`);
          const statusStr = String(statusSession);
          if (statusStr === 'isLogged' || statusStr === 'qrReadSuccess') {
            this.status = 'CONNECTED';
            this.qrCodeBase64 = null;
            this.qrCodeUrl = null;
          } else if (statusStr === 'disconnectedMobile' || statusStr === 'browserClose') {
            logger.warn(`Session status found: ${statusStr}. Scheduling disconnection cleanup.`);
            this.handleDisconnection();
          }
        },
        puppeteerOptions: {
          headless: true,
          executablePath: config.puppeteerExecutablePath || undefined,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        },
      });

      this.status = 'CONNECTED';
      this.qrCodeBase64 = null;
      this.qrCodeUrl = null;
      logger.info('WPPConnect client started and authenticated successfully!');

      // Set up message listener
      this.client.onMessage((message: wppconnect.Message) => {
        onMessageCallback(message);
      });

      // Handle disconnection state changes
      this.client.onStateChange((state) => {
        logger.info(`WhatsApp connection state changed to: ${state}`);
        const stateStr = String(state);
        if (stateStr === 'CONNECTED') {
          this.status = 'CONNECTED';
        } else if (stateStr === 'PAIRING') {
          this.status = 'INITIALIZING';
        } else if (stateStr === 'UNPAIRED' || stateStr === 'DISCONNECTED') {
          logger.warn(`Connection state found: ${stateStr}. Scheduling disconnection cleanup.`);
          this.handleDisconnection();
        } else {
          this.status = 'DISCONNECTED';
        }
      });
      
    } catch (error) {
      this.status = 'DISCONNECTED';
      this.client = null;
      logger.error('Error during WPPConnect initialization:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        logger.info('WPPConnect client connection closed successfully');
      } catch (error) {
        logger.error('Error closing WPPConnect client connection:', error);
      } finally {
        this.client = null;
        this.status = 'DISCONNECTED';
      }
    }
  }

  private async handleDisconnection(): Promise<void> {
    if (this.isDisconnecting) return;
    this.isDisconnecting = true;

    logger.warn('Handling client disconnection: terminating Puppeteer browser and cleaning locks...');
    
    try {
      await this.disconnect();
    } catch (err: any) {
      logger.error('Error during disconnect step in handleDisconnection:', err);
    }

    // Auto-reinitialize to request a new QR code after 3 seconds
    setTimeout(() => {
      this.isDisconnecting = false;
      if (this.messageCallback) {
        logger.info('Auto-reinitializing WhatsApp client to fetch new QR code...');
        this.initialize(this.messageCallback).catch((err) => {
          logger.error('Failed to auto-reinitialize client:', err);
        });
      }
    }, 3000);
  }
}
