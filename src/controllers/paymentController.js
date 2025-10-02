import Payment from '../models/Payment.js';
import Delivery from '../models/Delivery.js';
import { validatePayment } from '../middleware/validation.js';
import { processPaystackPayment } from '../services/paymentService.js';
import { sendPaymentNotification } from '../services/notificationService.js';

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private (Customer)
export const initializePayment = async (req, res) => {
  try {
    // Validate request body
    const { error } = validatePayment(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { deliveryId, amount, paymentMethod } = req.body;

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if delivery belongs to the customer
    if (delivery.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to pay for this delivery' });
    }

    // Check if delivery is already paid
    if (delivery.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Delivery is already paid for' });
    }

    // Generate a unique reference
    const transactionReference = `SWR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Initialize payment with Paystack
    const paymentData = {
      email: req.user.email,
      amount: amount * 100, // Convert to kobo (smallest currency unit)
      reference: transactionReference,
      metadata: {
        deliveryId: deliveryId,
        customerId: req.user.id,
        custom_fields: [
          {
            display_name: "Delivery ID",
            variable_name: "delivery_id",
            value: deliveryId
          }
        ]
      }
    };

    const paymentResponse = await processPaystackPayment(paymentData);

    // Create payment record
    const payment = await Payment.create({
      customer: req.user.id,
      delivery: deliveryId,
      amount,
      paymentMethod,
      transactionReference,
      status: 'pending',
      gatewayResponse: paymentResponse
    });

    res.status(201).json({
      payment,
      authorizationUrl: paymentResponse.data.authorization_url
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ message: 'Server error initializing payment' });
  }
};

// @desc    Verify payment
// @route   GET /api/payments/verify/:reference
// @access  Private (Customer)
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Find payment record
    const payment = await Payment.findOne({ transactionReference: reference })
      .populate('delivery')
      .populate('customer');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment belongs to the customer
    if (payment.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to verify this payment' });
    }

    // Verify payment with Paystack
    const axios = await import('axios');
    const response = await axios.default.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const verificationData = response.data;

    // Update payment status based on verification
    if (verificationData.data.status === 'success') {
      payment.status = 'success';
      
      // Update delivery payment status
      await Delivery.findByIdAndUpdate(payment.delivery._id, {
        paymentStatus: 'paid',
        actualCost: payment.amount
      });

      // Send payment confirmation email
      await sendPaymentNotification(
        payment.customer.email,
        'payment_success',
        {
          customerName: payment.customer.name,
          amount: payment.amount,
          deliveryId: payment.delivery._id,
          transactionReference: payment.transactionReference
        }
      );
    } else {
      payment.status = 'failed';
      
      // Send payment failure email
      await sendPaymentNotification(
        payment.customer.email,
        'payment_failed',
        {
          customerName: payment.customer.name,
          amount: payment.amount,
          deliveryId: payment.delivery._id
        }
      );
    }

    payment.gatewayResponse = verificationData;
    await payment.save();

    res.json({
      payment,
      verification: verificationData
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
};

// @desc    Get payment history for customer
// @route   GET /api/payments/history
// @access  Private (Customer)
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user.id })
      .populate('delivery')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error fetching payment history' });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('delivery');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user is authorized to view this payment
    if (req.user.role === 'customer' && payment.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error fetching payment' });
  }
};