import express from 'express';
import {
  createDelivery,
  getCustomerDeliveries,
  getAvailableDeliveries,
  getRiderDeliveries,
  acceptDelivery,
  updateDeliveryStatus,
  getDelivery
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', protect, authorize('customer'), createDelivery);
router.get('/customer', protect, authorize('customer'), getCustomerDeliveries);

// Rider routes
router.get('/available', protect, authorize('rider'), getAvailableDeliveries);
router.get('/rider', protect, authorize('rider'), getRiderDeliveries);
router.put('/:id/accept', protect, authorize('rider'), acceptDelivery);
router.put('/:id/status', protect, authorize('rider', 'admin'), updateDeliveryStatus);

// Common routes
router.get('/:id', protect, getDelivery);

export default router;