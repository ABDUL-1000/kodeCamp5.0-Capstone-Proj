import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  getDeliveries,
  getDelivery,
  updateDelivery,
  getPayments,
  getAnalyticsData
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);

// Delivery management
router.get('/deliveries', getDeliveries);
router.get('/deliveries/:id', getDelivery);
router.put('/deliveries/:id', updateDelivery);

// Payment management
router.get('/payments', getPayments);

// Analytics
router.get('/analytics', getAnalyticsData);

export default router;