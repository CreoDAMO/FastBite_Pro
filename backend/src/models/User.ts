
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'driver' | 'merchant' | 'admin';
  walletAddress?: string;
  complianceStatus: 'verified' | 'pending' | 'suspended';
  fbtBalance: number;
  stakedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'driver', 'merchant', 'admin'], 
    default: 'customer' 
  },
  walletAddress: { type: String },
  complianceStatus: { 
    type: String, 
    enum: ['verified', 'pending', 'suspended'], 
    default: 'pending' 
  },
  fbtBalance: { type: Number, default: 0 },
  stakedAmount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
