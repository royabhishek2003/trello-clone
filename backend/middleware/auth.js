const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Not authorized, token missing' });
      }

      // Verify token
      const decoded = verifyAccessToken(token);

      // Fetch user and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      return next();
    } catch (error) {
      console.error('Access token verification failed:', error.message);
      // Fall through to demo mode instead of failing
    }
  }

  // If no token or verification failed, return 401
  return res.status(401).json({ error: 'Not authorized, token missing or invalid' });
};

module.exports = { protect };
