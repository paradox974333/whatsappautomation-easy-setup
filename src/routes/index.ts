import { Router } from 'express';
import sessionRoutes from './session.routes';
import leadRoutes from './lead.routes';
import chatRoutes from './chat.routes';

const router = Router();

router.use('/session', sessionRoutes);
router.use('/leads', leadRoutes);
router.use('/chats', chatRoutes);

export default router;
