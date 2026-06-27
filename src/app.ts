import express from 'express';
import cors from 'cors';
import routes from './routes';
import { httpLogger } from './middleware/log.middleware';
import { errorHandler } from './middleware/error.middleware';
import { WppClient } from './wpp/wpp.client';
import mongoose from 'mongoose';

const app = express();

// Express configuration
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support larger base64 file payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware
app.use(httpLogger);

// Health Endpoint
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'CONNECTED' : dbState === 2 ? 'CONNECTING' : 'DISCONNECTED';
  
  const wppClient = WppClient.getInstance();
  const wppStatus = wppClient.getStatus();
  const wppConnected = wppClient.isConnected();

  const isHealthy = dbState === 1 && (wppConnected || wppStatus === 'QR_READY' || wppStatus === 'INITIALIZING');

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date(),
    services: {
      database: {
        status: dbStatus,
      },
      whatsapp: {
        status: wppStatus,
        connected: wppConnected,
      },
    },
  });
});

// Mount minimal admin dashboard and redirect index to it
app.get('/admin', (req, res) => {
  const controller = new (require('./controllers/session.controller').SessionController)();
  controller.getAdminView(req, res);
});

app.get('/', (req, res) => {
  res.redirect('/admin');
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
