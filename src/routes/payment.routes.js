import { Router } from 'express';
import paymentController from '../controllers/payment.controller.js';

const router = Router();

// Health check endpoint
router.get('/health', paymentController.getHealth);

// Payment route definitions
router.post('/payment/order', paymentController.createOrder);
router.post('/payment/verify', paymentController.verifyPayment);

export default router;
