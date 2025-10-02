import Delivery from '../models/Delivery.js';
import User from '../models/User.js';
import { validateDelivery } from '../middleware/validation.js';
import { sendDeliveryNotification } from '../services/notificationService.js';

// @desc    Create a new delivery request
// @route   POST /api/deliveries
// @access  Private (Customer)
export const createDelivery = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateDelivery(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      pickupAddress,
      deliveryAddress,
      packageDescription,
      packageWeight,
      packageDimensions,
      estimatedCost
    } = req.body;

    // Calculate distance (simplified calculation)
    // In a real app, you would use a mapping service API
    const calculateDistance = (pickup, delivery) => {
      // This is a simplified calculation - in reality you'd use geocoding
      return Math.floor(Math.random() * 20) + 1; // Random distance between 1-20 km
    };

    const distance = calculateDistance(pickupAddress, deliveryAddress);

    const delivery = await Delivery.create({
      customer: req.user.id,
      pickupAddress,
      deliveryAddress,
      packageDescription,
      packageWeight,
      packageDimensions,
      estimatedCost,
      distance,
      status: 'pending'
    });

    // Populate customer details
    await delivery.populate('customer', 'name email phone');

    res.status(201).json(delivery);
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ message: 'Server error creating delivery' });
  }
};

// @desc    Get all deliveries for a customer
// @route   GET /api/deliveries/customer
// @access  Private (Customer)
export const getCustomerDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ customer: req.user.id })
      .populate('rider', 'name phone vehicleType')
      .sort({ createdAt: -1 });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Get customer deliveries error:', error);
    res.status(500).json({ message: 'Server error fetching deliveries' });
  }
};

// @desc    Get all available deliveries for riders
// @route   GET /api/deliveries/available
// @access  Private (Rider)
export const getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ status: 'pending' })
      .populate('customer', 'name phone address')
      .sort({ createdAt: -1 });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Get available deliveries error:', error);
    res.status(500).json({ message: 'Server error fetching available deliveries' });
  }
};

// @desc    Get all deliveries for a rider
// @route   GET /api/deliveries/rider
// @access  Private (Rider)
export const getRiderDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ rider: req.user.id })
      .populate('customer', 'name phone address')
      .sort({ createdAt: -1 });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Get rider deliveries error:', error);
    res.status(500).json({ message: 'Server error fetching rider deliveries' });
  }
};

// @desc    Accept a delivery request
// @route   PUT /api/deliveries/:id/accept
// @access  Private (Rider)
export const acceptDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    if (delivery.status !== 'pending') {
      return res.status(400).json({ message: 'Delivery is not available' });
    }
    
    // Check if rider is available
    const rider = await User.findById(req.user.id);
    if (!rider.isAvailable) {
      return res.status(400).json({ message: 'You are not available for deliveries' });
    }
    
    delivery.rider = req.user.id;
    delivery.status = 'accepted';
    await delivery.save();
    
    // Update rider availability
    rider.isAvailable = false;
    await rider.save();
    
    // Populate details for response
    await delivery.populate('customer', 'name email phone');
    await delivery.populate('rider', 'name phone vehicleType');
    
    // Send notification to customer
    await sendDeliveryNotification(
      delivery.customer.email,
      'delivery_accepted',
      {
        customerName: delivery.customer.name,
        deliveryId: delivery._id,
        riderName: delivery.rider.name,
        riderPhone: delivery.rider.phone
      }
    );
    
    res.json(delivery);
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({ message: 'Server error accepting delivery' });
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private (Rider, Admin)
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'in-progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    // Check if user is authorized to update this delivery
    if (req.user.role === 'rider' && delivery.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this delivery' });
    }
    
    delivery.status = status;
    
    // Set timestamps for specific status changes
    if (status === 'in-progress') {
      delivery.pickupTime = new Date();
    } else if (status === 'completed') {
      delivery.deliveryTime = new Date();
      
      // Make rider available again
      await User.findByIdAndUpdate(delivery.rider, { isAvailable: true });
    } else if (status === 'cancelled') {
      // If cancelled, make rider available again if there was one assigned
      if (delivery.rider) {
        await User.findByIdAndUpdate(delivery.rider, { isAvailable: true });
      }
    }
    
    await delivery.save();
    
    // Populate details for response
    await delivery.populate('customer', 'name email phone');
    await delivery.populate('rider', 'name phone vehicleType');
    
    // Send notification based on status change
    if (delivery.customer && delivery.customer.email) {
      let notificationType;
      let notificationData;
      
      switch(status) {
        case 'in-progress':
          notificationType = 'delivery_picked_up';
          notificationData = {
            customerName: delivery.customer.name,
            deliveryId: delivery._id
          };
          break;
        case 'completed':
          notificationType = 'delivery_completed';
          notificationData = {
            customerName: delivery.customer.name,
            deliveryId: delivery._id
          };
          break;
        case 'cancelled':
          notificationType = 'delivery_cancelled';
          notificationData = {
            customerName: delivery.customer.name,
            deliveryId: delivery._id
          };
          break;
      }
      
      if (notificationType) {
        await sendDeliveryNotification(
          delivery.customer.email,
          notificationType,
          notificationData
        );
      }
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ message: 'Server error updating delivery status' });
  }
};

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
export const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('rider', 'name phone vehicleType licensePlate');
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    // Check if user is authorized to view this delivery
    if (req.user.role === 'customer' && delivery.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this delivery' });
    }
    
    if (req.user.role === 'rider' && delivery.rider && delivery.rider._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this delivery' });
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ message: 'Server error fetching delivery' });
  }
};