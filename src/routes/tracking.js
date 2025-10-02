import express from 'express';
import {
  updateLocation,
  getTrackingHistory,
  getCurrentLocation
} from '../controllers/trackingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/location', protect, authorize('rider'), updateLocation);
router.get('/:deliveryId', protect, getTrackingHistory);
router.get('/:deliveryId/current', protect, getCurrentLocation);

export default router;