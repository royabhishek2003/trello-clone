const axios = require('axios');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyRefreshToken
} = require('../config/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Default placeholder image
    const imageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}`;

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      imageUrl
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      token: accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
        activeOrganization: user.activeOrganization
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      token: accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
        activeOrganization: user.activeOrganization
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error('Refresh token verification failed:', error.message);
    res.status(401).json({ error: 'Refresh token invalid' });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    clearRefreshTokenCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Google OAuth Callback / Verification
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body; // credential (idToken) from google login button
    if (!token) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify token with google API
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { email, given_name, family_name, picture, sub } = response.data;

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update Google ID and picture if not set
      if (!user.googleId) user.googleId = sub;
      if (!user.imageUrl) user.imageUrl = picture || user.imageUrl;
      await user.save();
    } else {
      // Create user
      user = await User.create({
        firstName: given_name || 'Google',
        lastName: family_name || 'User',
        email,
        imageUrl: picture || '',
        googleId: sub
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      token: accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
        activeOrganization: user.activeOrganization
      }
    });
  } catch (error) {
    console.error('Google verification error:', error.message);
    res.status(400).json({ error: 'Google authentication failed' });
  }
};

// @desc    Get current user (Demo/Fallback included)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        imageUrl: req.user.imageUrl,
        activeOrganization: req.user.activeOrganization
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Demo Login
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
  try {
    const user = await User.findOne({ email: 'tony@stark.com' });
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      token: accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
        activeOrganization: user.activeOrganization
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  googleAuth,
  getMe,
  demoLogin
};
