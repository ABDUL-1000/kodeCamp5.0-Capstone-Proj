import express from 'express';
import { body, validationResult, param } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin, requireCustomer } from '../middleware/auth.js';

const router = express.Router();

// POST /orders - customers only
router.post('/',
  requireAuth,
  requireCustomer,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.productId').isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress.street').isString().trim().notEmpty().withMessage('Street is required'),
    body('shippingAddress.city').isString().trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').isString().trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').isString().trim().notEmpty().withMessage('Zip code is required'),
    body('shippingAddress.country').isString().trim().notEmpty().withMessage('Country is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { items, shippingAddress } = req.body;
      const customerId = req.user.userId;

      // Validate products and calculate totals
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${item.productId}` });
        }

        if (product.stockStatus === 'out-of-stock') {
          return res.status(400).json({ error: `Product out of stock: ${product.productName}` });
        }

        const itemTotal = product.cost * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productName: product.productName,
          productId: product._id,
          quantity: item.quantity,
          unitPrice: product.cost,
          totalCost: itemTotal
        });
      }

      // Create order
      const order = await Order.create({
        customerId,
        items: orderItems,
        totalAmount,
        shippingAddress
      });

      // Populate customer details
      const populatedOrder = await Order.findById(order._id)
        .populate('customerId', 'username email')
        .populate('items.productId', 'productName cost');

      res.status(201).json(populatedOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /orders - admin only (view all orders)
router.get('/',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      
      const filter = {};
      if (status && ['pending', 'shipped', 'delivered'].includes(status)) {
        filter.shippingStatus = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          { path: 'customerId', select: 'username email' },
          { path: 'items.productId', select: 'productName cost' }
        ],
        sort: { createdAt: -1 }
      };

      const orders = await Order.paginate(filter, options);
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /orders/:id - admin only (view specific order)
router.get('/:id',
  requireAuth,
  requireAdmin,
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      
      const order = await Order.findById(id)
        .populate('customerId', 'username email')
        .populate('items.productId', 'productName cost brand');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /orders/:id/status - admin only (update shipping status)
router.put('/:id',
  requireAuth,
  requireAdmin,
  param('id').isMongoId(),
  body('shippingStatus').isIn(['pending', 'shipped', 'delivered']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { shippingStatus } = req.body;

      const order = await Order.findByIdAndUpdate(
        id,
        { shippingStatus },
        { new: true }
      )
        .populate('customerId', 'username email')
        .populate('items.productId', 'productName cost');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /orders/customer/my-orders - customer view their own orders
router.get('/customer/my-orders',
  requireAuth,
  requireCustomer,
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const customerId = req.user.userId;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          { path: 'items.productId', select: 'productName cost brand' }
        ],
        sort: { createdAt: -1 }
      };

      const orders = await Order.paginate({ customerId }, options);
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;