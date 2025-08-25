import express from 'express';
import { body, validationResult, param } from 'express-validator';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Brand from "../models/Brand.js";

const router = express.Router();

// GET /products - public
// GET /products - public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate("brand", "brandName") // Ensure brandName is populated
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /products/:brand/:page/:limit

router.get("/:brand/:page/:limit", async (req, res) => {
  const { brand, page, limit } = req.params;

  try {
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      populate: "brand",
      sort: { createdAt: -1 }
    };

    const result = await Product.paginate({ brand }, options);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /products - admin only
// POST /products - admin only
router.post('/',
  requireAuth, requireAdmin,
  body('productName').isString().trim().notEmpty(),
  body('cost').isFloat({ min: 0 }),
  body('productImages').optional().isArray(),
  body('description').optional().isString(),
  body('stockStatus').optional().isIn(['in-stock', 'out-of-stock', 'pre-order']),
  body('brand').isMongoId(), // Add validation for brand
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { productName, cost, productImages = [], description = '', stockStatus = 'in-stock', brand } = req.body;

      const ownerId = req.user.userId;

      // Check if brand exists
      const brandExists = await Brand.findById(brand);
      if (!brandExists) {
        return res.status(404).json({ error: 'Brand not found' });
      }

      const product = await Product.create({
        productName, 
        ownerId, 
        cost, 
        productImages, 
        description, 
        stockStatus, 
        brand
      });

      // Populate the brand field with brandName
      const populatedProduct = await Product.findById(product._id)
        .populate("brand", "brandName");

      res.status(201).json(populatedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
// PUT /products/:id - admin only (update any field)
// PUT /products/:id - admin only
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  param("id").isMongoId(),
  body("productName").optional().isString(),
  body("cost").optional().isFloat({ min: 0 }),
  body("productImages").optional().isArray(),
  body("description").optional().isString(),
  body("stockStatus").optional().isIn(["in-stock", "out-of-stock", "pre-order"]),
  body("brand").optional().isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updates = req.body;

     
      if (updates.brand) {
        const brandExists = await Brand.findById(updates.brand);
        if (!brandExists) {
          return res.status(404).json({ error: 'Brand not found' });
        }
      }

      const product = await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      ).populate("brand", "brandName"); 

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);


// DELETE /products/:id - admin only
router.delete('/:id',
  requireAuth, requireAdmin,
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Product not found' });
      res.json({ ok: true, deletedId: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
