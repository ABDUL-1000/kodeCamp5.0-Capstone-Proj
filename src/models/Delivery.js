import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupAddress: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  packageDescription: {
    type: String,
    required: true
  },
  packageWeight: {
    type: Number,
    required: true
  },
  packageDimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  estimatedCost: {
    type: Number,
    required: true
  },
  actualCost: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  pickupTime: Date,
  deliveryTime: Date,
  estimatedDeliveryTime: Date,
  distance: Number // in kilometers
}, {
  timestamps: true
});

export default mongoose.model('Delivery', deliverySchema);