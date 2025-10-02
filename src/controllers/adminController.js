import User from '../models/User.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import { getAnalytics } from '../services/analyticsService.js';


export const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role && ['customer', 'rider', 'admin'].includes(role)) {
      query.role = role;
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};


export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { isVerified, isAvailable } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isAvailable !== undefined) user.isAvailable = isAvailable;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};


export const getDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const deliveries = await Delivery.find(query)
      .populate('customer', 'name email phone')
      .populate('rider', 'name phone vehicleType')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Delivery.countDocuments(query);
    
    res.json({
      deliveries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Server error fetching deliveries' });
  }
};


export const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('rider', 'name phone vehicleType licensePlate');
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ message: 'Server error fetching delivery' });
  }
};


export const updateDelivery = async (req, res) => {
  try {
    const { status, riderId, actualCost } = req.body;
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    if (status) delivery.status = status;
    if (riderId) delivery.rider = riderId;
    if (actualCost) delivery.actualCost = actualCost;
    
    await delivery.save();
    
    // Populate details for response
    await delivery.populate('customer', 'name email phone');
    await delivery.populate('rider', 'name phone vehicleType');
    
    res.json(delivery);
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ message: 'Server error updating delivery' });
  }
};


export const getPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const payments = await Payment.find(query)
      .populate('customer', 'name email')
      .populate('delivery')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};


export const getAnalyticsData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await getAnalytics(startDate, endDate);
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};