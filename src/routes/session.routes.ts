import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';

const router = Router();
const controller = new SessionController();

router.get('/status', controller.getStatus);
router.get('/qr', controller.getQrCode);
router.get('/qr-view', controller.getQrView);
router.get('/admin', controller.getAdminView);
router.post('/init', controller.initializeSession);
router.post('/disconnect', controller.disconnectSession);

export default router;
