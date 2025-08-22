import express from "express";
import { body, param, validationResult } from "express-validator";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import Brand from "../models/Brand.js";

const router = express.Router();

// POST /brands (admin only)
router.post("/",
  requireAuth, requireAdmin,
  body("brandName").isString().trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { brandName } = req.body;
      const existing = await Brand.findOne({ brandName });
      if (existing) return res.status(409).json({ error: "Brand already exists" });

      const brand = await Brand.create({ brandName });
      res.status(201).json(brand);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT /brands/:id (admin only)
router.put("/:id",
  requireAuth, requireAdmin,
  param("id").isMongoId(),
  body("brandName").isString().trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const { brandName } = req.body;

      const brand = await Brand.findByIdAndUpdate(id, { brandName }, { new: true });
      if (!brand) return res.status(404).json({ error: "Brand not found" });

      res.json(brand);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /brands (public)
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /brands/:id (admin only)
router.delete("/:id",
  requireAuth, requireAdmin,
  param("id").isMongoId(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Brand.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Brand not found" });

      res.json({ ok: true, deletedId: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
