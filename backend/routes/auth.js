




const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService');
const { checkLoginAttempts } = require('../middleware/rbacMiddleware');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, department } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Validate role and department combination
    if (role?.includes('_manager') && !department) {
      return res.status(400).json({ error: 'Department is required for manager roles' });
    }

    // Set default permissions based on role and department
    const permissions = [];
    if (role?.includes('_manager')) {
      permissions.push({
        module: department,
        actions: ['read', 'write', 'admin']
      });
    } else if (department && department !== 'General') {
      permissions.push({
        module: department,
        actions: ['read']
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      department: department || 'General',
      permissions,
      isVerified: true, // Auto-verify for testing
      status: 'active',
      loginAttempts: {
        count: 0,
        lastAttempt: new Date()
      }
    });

    await user.save();

    // Generate token for immediate login
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        department: user.department,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'omnii_secure_jwt_secret_2024',
      { expiresIn: '24h' }
    );

    console.log('Registration successful. Generated token for user:', {
      userId: user._id,
      role: user.role,
      department: user.department
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        role: user.role,
        department: user.department,
        username: user.username,
        email: user.email,
        mfaEnabled: false
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', checkLoginAttempts, async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;
    const user = await User.findOne({ email });

    // Check if user exists and password is valid
    if (!user || !(await user.isValidPassword(password))) {
      if (user) {
        // Increment login attempts
        user.loginAttempts = {
          count: (user.loginAttempts?.count || 0) + 1,
          lastAttempt: new Date()
        };
        await user.save();
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active. Please contact support.' });
    }

    // Verify MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(401).json({ 
          error: 'MFA token required',
          mfaRequired: true
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid MFA token' });
      }
    }

    // Reset login attempts on successful login
    user.loginAttempts = {
      count: 0,
      lastAttempt: new Date()
    };
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token with enhanced claims
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        department: user.department,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'omnii_secure_jwt_secret_2024',
      { expiresIn: '24h' }
    );

    // Log token generation
    console.log('Generated token for user:', {
      userId: user._id,
      role: user.role,
      department: user.department
    });

    res.json({ 
      token,
      user: {
        id: user._id,
        role: user.role,
        department: user.department,
        username: user.username,
        email: user.email,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Setup MFA
router.post('/mfa/setup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `OmniFlow.ai:${user.email}`
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret to user
    user.mfaSecret = secret.base32;
    user.mfaEnabled = false; // Will be enabled after verification
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify and enable MFA
router.post('/mfa/verify', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    user.mfaEnabled = true;
    await user.save();

    res.json({ message: 'MFA enabled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disable MFA
router.post('/mfa/disable', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.userId);

    // Verify password before disabling MFA
    if (!(await user.isValidPassword(password))) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Create new verification token
    user.verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, user.verificationToken);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;




