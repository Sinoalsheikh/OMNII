const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'omnii_secure_jwt_secret_2024';

const authMiddleware = (req, res, next) => {
  try {
    // Log the incoming authorization header
    console.log('Auth Header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded successfully:', { userId: decoded.userId, role: decoded.role });
      
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        department: decoded.department,
        permissions: decoded.permissions
      };
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired', code: 'TOKEN_EXPIRED' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token format', code: 'INVALID_TOKEN' });
      }
      res.status(401).json({ error: 'Token is not valid', code: 'TOKEN_INVALID' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error in auth middleware' });
  }
};

module.exports = authMiddleware;
