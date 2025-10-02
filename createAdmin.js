import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import the User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      phone: String,
      address: String,
      isVerified: Boolean,
      isAvailable: Boolean
    }));

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@swiftrider.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      name: 'SwiftRider Admin',
      email: 'admin@swiftrider.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'admin',
      address: 'Admin Headquarters',
      isVerified: true,
      isAvailable: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@swiftrider.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();