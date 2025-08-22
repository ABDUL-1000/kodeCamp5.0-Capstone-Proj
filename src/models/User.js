import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
