import { Router } from 'express';
import { WhatsAppController } from './whatsapp.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { optionalToken } from '../../middleware/auth.middleware.js';
import {
  sendOrderConfirmationSchema,
  sendStatusUpdateSchema,
} from './whatsapp.schemas.js';

const router = Router();

router.use(optionalToken);

// 7.1 Send Order Confirmation WhatsApp Message
router.post(
  '/send-order-confirmation',
  validate({ body: sendOrderConfirmationSchema }),
  WhatsAppController.sendOrderConfirmation
);

// 7.2 Send Status Update
router.post(
  '/send-status-update',
  validate({ body: sendStatusUpdateSchema }),
  WhatsAppController.sendStatusUpdate
);

export default router;
