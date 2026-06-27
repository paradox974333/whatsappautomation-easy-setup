import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const controller = new ChatController();

router.get('/', controller.getChats);
router.get('/:phone', controller.getChatHistory);
router.post('/:phone/send', controller.sendManualMessage);

export default router;
