const express = require('express');
const { body } = require('express-validator');
const { register, login, demoLogin, refreshToken, logout, googleAuth, getMe } = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName', 'First name is required').notEmpty(),
    body('lastName', 'Last name is required').notEmpty(),
    body('email', 'Please enter a valid email address').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email', 'Please enter a valid email address').isEmail(),
    body('password', 'Password is required').exists()
  ],
  validate,
  login
);

router.post('/demo-login', demoLogin);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
