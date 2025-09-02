import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken'; 
import userRoutes from './src/routes/users.js';
import orderRoutes from './src/routes/orders.js';
import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import brandRoutes from './src/routes/brands.js';
import http from "http";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));


// Make io available to routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } 
});

//   console.log("User connected:", socket.id);

//   // Expect client to emit their userId after login
//   socket.on("register", (userId) => {
//     connectedUsers[userId] = socket.id;
//   });

//   socket.on("disconnect", () => {
//     for (const userId in connectedUsers) {
//       if (connectedUsers[userId] === socket.id) {
//         delete connectedUsers[userId];
//         break;
//       }
//     }
//     console.log("User disconnected:", socket.id);
//   });
// });

server.listen(8000, () => console.log("Socket Server running on 8000"));

// Health check
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'ecommerce-api' });
});
app.use( (req, res, next) => {
  req.io = io;
  next();
})
app.use('/brands', brandRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);


io.use((socket, next) => {
  const auth = socket.handshake.headers.authorization;
  const [type, token] = auth.split(" ");
  console.log("type", type, "token", token);
  if (type.toLocaleLowerCase() == "bearer") {
    const value = jwt.verify(token, process.env.JWT_SECRET);

    socket.handshake.auth.decoded = value;
  } else {
    socket.send("You need to supply an authorization token");
  }
  next();
});

// Socket.io Connection Handling
io.on("connection", (socket) => {
  const decoded = socket.handshake.auth.decoded;
  
  console.log('User connected:', socket.id, 'User ID:', decoded.userId);

  // Join a room with the user's ID
  socket.join(decoded.userId);

  socket.on("disconnect", () => {
    socket.leave(decoded.userId);
    console.log('User disconnected:', socket.id, 'User ID:', decoded.userId);
  });
});

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
  
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });