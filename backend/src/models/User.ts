
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
  phoneNumber?: string;
  profileImage?: string;
  location?: {
    address: string;
    coordinates: [number, number];
  };
  preferences?: {
    dietaryRestrictions: string[];
    cuisinePreferences: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  driverProfile?: {
    vehicleType: string;
    licenseNumber: string;
    insurance: string;
    rating: number;
    earnings: number;
    hoursWorked: number;
    completedOrders: number;
    benefits: string[];
    guaranteedWage: number;
    lastBackgroundCheck: Date;
  };
  merchantProfile?: {
    businessName: string;
    businessLicense: string;
    taxId: string;
    subscriptionStatus: 'active' | 'inactive' | 'suspended';
    subscriptionTier: 'basic' | 'premium' | 'enterprise';
  };
  twoFactorAuth?: {
    enabled: boolean;
    secret?: string;
    backupCodes?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['customer', 'driver', 'merchant', 'admin'], 
    default: 'customer' 
  },
  walletAddress: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  complianceStatus: { 
    type: String, 
    enum: ['verified', 'pending', 'suspended'], 
    default: 'pending' 
  },
  fbtBalance: { 
    type: Number, 
    default: 0,
    min: 0
  },
  stakedAmount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  profileImage: String,
  location: {
    address: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  preferences: {
    dietaryRestrictions: [String],
    cuisinePreferences: [String],
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  driverProfile: {
    vehicleType: String,
    licenseNumber: String,
    insurance: String,
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    earnings: { type: Number, default: 0, min: 0 },
    hoursWorked: { type: Number, default: 0, min: 0 },
    completedOrders: { type: Number, default: 0, min: 0 },
    benefits: [String],
    guaranteedWage: { type: Number, default: 18.50 },
    lastBackgroundCheck: Date
  },
  merchantProfile: {
    businessName: String,
    businessLicense: String,
    taxId: String,
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'inactive'
    },
    subscriptionTier: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    }
  },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    secret: String,
    backupCodes: [String]
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.twoFactorAuth?.secret;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ walletAddress: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
