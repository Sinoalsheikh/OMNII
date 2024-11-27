



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'hr_manager', 'finance_manager', 'sales_manager', 'marketing_manager', 'operations_manager', 'rd_manager', 'customer_service_manager'],
    default: 'user'
  },
  department: {
    type: String,
    enum: ['HR', 'Finance', 'Sales', 'Marketing', 'Operations', 'R&D', 'Customer_Service', 'General'],
    default: 'General'
  },
  permissions: [{
    module: {
      type: String,
      enum: ['HR', 'Finance', 'Sales', 'Marketing', 'Operations', 'R&D', 'Customer_Service']
    },
    actions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'admin']
    }]
  }],
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: String,
  lastLogin: Date,
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password validity
UserSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);



