const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  // Only allow 'admin' role to be self-assigned if explicitly intended;
  // in production you may want to restrict this to invite-only.
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'member',
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account has been deactivated. Contact an administrator.',
    });
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;

  await user.save();

  res.status(200).json({ success: true, user });
});

// @desc    Logout (client-side token discard; endpoint provided for completeness /
//          future blacklist-based invalidation)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
