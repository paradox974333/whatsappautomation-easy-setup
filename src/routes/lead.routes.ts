import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';

const router = Router();
const controller = new LeadController();

router.get('/', controller.getLeads);
router.get('/:id', controller.getLeadById);
router.put('/:id', controller.updateLeadStatus);
router.delete('/:id', controller.deleteLead);

export default router;
