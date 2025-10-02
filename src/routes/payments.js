import express from 'express';
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getPayment
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/initialize', protect, authorize('customer'), initializePayment);
router.get('/verify/:reference', protect, authorize('customer'), verifyPayment);
router.get('/history', protect, authorize('customer'), getPaymentHistory);
router.get('/:id', protect, getPayment);

export default router;