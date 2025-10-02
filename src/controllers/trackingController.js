import Tracking from '../models/Tracking.js';
import Delivery from '../models/Delivery.js';
import { validateTracking } from '../middleware/validation.js';

// @desc    Update rider location
// @route   POST /api/tracking/location
// @access  Private (Rider)
export const updateLocation = async (req, res) => {
  try {
    const { deliveryId, latitude, longitude } = req.body;

    // Check if delivery exists and belongs to the rider
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to track this delivery' });
    }

    // Create tracking record
    const tracking = await Tracking.create({
      delivery: deliveryId,
      rider: req.user.id,
      location: { latitude, longitude },
      status: delivery.status
    });

    res.status(201).json(tracking);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error updating location' });
  }
};

// @desc    Get delivery tracking history
// @route   GET /api/tracking/:deliveryId
// @access  Private
export const getTrackingHistory = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if user is authorized to view tracking
    if (req.user.role === 'customer' && delivery.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this tracking' });
    }

    if (req.user.role === 'rider' && delivery.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this tracking' });
    }

    const trackingHistory = await Tracking.find({ delivery: deliveryId })
      .sort({ createdAt: -1 });

    res.json(trackingHistory);
  } catch (error) {
    console.error('Get tracking history error:', error);
    res.status(500).json({ message: 'Server error fetching tracking history' });
  }
};

// @desc    Get current delivery location
// @route   GET /api/tracking/:deliveryId/current
// @access  Private
export const getCurrentLocation = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if user is authorized to view tracking
    if (req.user.role === 'customer' && delivery.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this tracking' });
    }

    if (req.user.role === 'rider' && delivery.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this tracking' });
    }

    const currentLocation = await Tracking.findOne({ delivery: deliveryId })
      .sort({ createdAt: -1 });

    res.json(currentLocation);
  } catch (error) {
    console.error('Get current location error:', error);
    res.status(500).json({ message: 'Server error fetching current location' });
  }
};