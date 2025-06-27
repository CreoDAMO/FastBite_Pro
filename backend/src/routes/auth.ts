
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { redis } from '../database';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

const generateTokens = (userId: string, email: string, role: string) => {
  const payload = { userId, email, role };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });
  
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  authLimiter,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['customer', 'driver', 'merchant'])
    .withMessage('Invalid role'),
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password, name, role = 'customer', phoneNumber } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = new User({
    email,
    password: hashedPassword,
    name,
    role,
    phoneNumber,
    complianceStatus: 'pending'
  });

  // Initialize role-specific profiles
  if (role === 'driver') {
    user.driverProfile = {
      vehicleType: '',
      licenseNumber: '',
      insurance: '',
      rating: 5.0,
      earnings: 0,
      hoursWorked: 0,
      completedOrders: 0,
      benefits: ['Health Insurance', 'Guaranteed Wage'],
      guaranteedWage: 18.50,
      lastBackgroundCheck: new Date()
    };
  } else if (role === 'merchant') {
    user.merchantProfile = {
      businessName: '',
      businessLicense: '',
      taxId: '',
      subscriptionStatus: 'inactive',
      subscriptionTier: 'basic'
    };
  }

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.email, user.role);

  // Store refresh token in Redis
  await redis.setex(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, refreshToken);

  logger.info(`User registered successfully: ${user.email} (${user.role})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      complianceStatus: user.complianceStatus,
      fbtBalance: user.fbtBalance
    },
    token: accessToken,
    refreshToken
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  authLimiter,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if user is suspended
  if (user.complianceStatus === 'suspended') {
    return res.status(403).json({
      success: false,
      message: 'Account suspended. Please contact support.'
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.email, user.role);

  // Store refresh token in Redis
  await redis.setex(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, refreshToken);

  // Update last login
  user.updatedAt = new Date();
  await user.save();

  logger.info(`User logged in successfully: ${user.email}`);

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      walletAddress: user.walletAddress,
      complianceStatus: user.complianceStatus,
      fbtBalance: user.fbtBalance
    },
    token: accessToken,
    refreshToken
  });
}));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    
    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.complianceStatus === 'suspended') {
      return res.status(401).json({
        success: false,
        message: 'User not found or suspended'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.email, user.role);

    // Update refresh token in Redis
    await redis.setex(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Remove refresh token from Redis
      await redis.del(`refresh_token:${decoded.userId}`);
      
      // Add access token to blacklist
      await redis.setex(`blacklist:${token}`, 24 * 60 * 60, '1'); // 24 hours
      
      logger.info(`User logged out successfully: ${decoded.email}`);
    } catch (error) {
      // Token might be invalid, but still return success
      logger.warn('Logout with invalid token:', error);
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  authLimiter,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // Store reset token in Redis
  await redis.setex(`password_reset:${user._id}`, 60 * 60, resetToken); // 1 hour

  // TODO: Send email with reset link
  // await sendPasswordResetEmail(user.email, resetToken);

  logger.info(`Password reset requested for: ${user.email}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  authLimiter,
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { token, password } = req.body;

  try {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if reset token exists in Redis
    const storedToken = await redis.get(`password_reset:${decoded.userId}`);
    if (!storedToken || storedToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Remove reset token from Redis
    await redis.del(`password_reset:${decoded.userId}`);

    // Invalidate all existing refresh tokens
    await redis.del(`refresh_token:${decoded.userId}`);

    logger.info(`Password reset successfully for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Password reset failed:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }
}));

export default router;
