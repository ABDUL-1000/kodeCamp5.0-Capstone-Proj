import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import brandRoutes from './src/routes/brands.js';
import orderRoutes from './src/routes/order.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'ecommerce-api' });
});

app.use('/brands', brandRoutes);
app.use('/orders', orderRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Mongo connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in environment');
  process.exit(1);
}

mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
