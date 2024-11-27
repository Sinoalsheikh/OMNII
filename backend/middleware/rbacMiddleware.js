const createError = require('http-errors');

// Helper function to check if user has required permissions
const hasPermission = (user, module, requiredAction) => {
  if (user.role === 'admin') return true;
  
  const modulePermissions = user.permissions.find(p => p.module === module);
  if (!modulePermissions) return false;
  
  return modulePermissions.actions.includes(requiredAction);
};

// Middleware to check department access
const checkDepartmentAccess = (department) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      // Admin has access to all departments
      if (user.role === 'admin') return next();
      
      // Check if user belongs to the required department or has specific permissions
      if (user.department === department || hasPermission(user, department, 'read')) {
        return next();
      }
      
      throw createError(403, 'Access denied: Insufficient department permissions');
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check specific action permissions
const checkPermission = (module, requiredAction) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (hasPermission(user, module, requiredAction)) {
        return next();
      }
      
      throw createError(403, 'Access denied: Insufficient action permissions');
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check role
const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (typeof roles === 'string') {
        roles = [roles];
      }
      
      if (roles.includes(userRole) || userRole === 'admin') {
        return next();
      }
      
      throw createError(403, 'Access denied: Insufficient role permissions');
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting middleware for login attempts
const checkLoginAttempts = async (req, res, next) => {
  try {
    const { email } = req.body;
    const User = require('../models/User');
    const user = await User.findOne({ email });
    
    if (!user) return next();
    
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
    
    // Check if account is locked
    if (user.loginAttempts?.count >= MAX_LOGIN_ATTEMPTS) {
      const lockExpired = new Date() - user.loginAttempts.lastAttempt > LOCK_TIME;
      
      if (!lockExpired) {
        throw createError(429, 'Account temporarily locked. Please try again later.');
      }
      
      // Reset login attempts if lock has expired
      user.loginAttempts = {
        count: 0,
        lastAttempt: new Date()
      };
      await user.save();
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkDepartmentAccess,
  checkPermission,
  checkRole,
  checkLoginAttempts,
  hasPermission
};
