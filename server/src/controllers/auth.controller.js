const crypto = require('crypto');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../services/token.service');
const userService = require('../services/supabaseUser.service');
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/email.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, password, role } = req.body;

  const userExists = await userService.findByEmail(email);
  if (userExists) {
    return sendError(res, 'User already exists with this email address', 400);
  }

  const verifyToken = userService.createEmailVerificationToken();
  const user = await userService.create({
    fullName,
    email,
    phone,
    password,
    role: role || 'customer',
    isEmailVerified: false,
    emailVerificationToken: verifyToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    refreshTokens: [],
  });

  // Send verification email
  try {
    await sendVerificationEmail(user, verifyToken);
  } catch (error) {
    console.error(`❌ Registration email delivery failed: ${error.message}`);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push(refreshToken);
  await userService.update(user);

  user.password = undefined;

  return sendSuccess(res, { user, accessToken, refreshToken }, 'User registered successfully. Verification email sent.', 211);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Please provide email and password', 400);
  }

  const user = await userService.findByEmail(email);
  if (!user || !(await userService.comparePassword(password, user.password))) {
    return sendError(res, 'Invalid credentials', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'User account is suspended', 403);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push(refreshToken);
  await userService.update(user);

  user.password = undefined;

  return sendSuccess(res, { user, accessToken, refreshToken }, 'Login successful');
});

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', 400);
  }

  const user = await userService.findByRefreshToken(refreshToken);
  if (user) {
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    await userService.update(user);
  }

  return sendSuccess(res, null, 'Logged out successfully');
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', 400);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }

  const user = await userService.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Rotate refresh tokens
  user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
  user.refreshTokens.push(newRefreshToken);
  await userService.update(user);

  return sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed successfully');
});

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const userToVerify = await userService.findByEmailVerificationToken(hashedToken);

  if (!userToVerify) {
    return sendError(res, 'Verification token is invalid or has expired', 400);
  }

  userToVerify.isEmailVerified = true;
  userToVerify.emailVerificationToken = undefined;
  userToVerify.emailVerificationExpires = undefined;
  await userService.update(userToVerify);

  try {
    await sendWelcomeEmail(userToVerify);
  } catch (error) {
    console.error(`❌ Welcome email delivery failed: ${error.message}`);
  }

  return sendSuccess(res, null, 'Email verified successfully. You can now login.');
});

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    return sendError(res, 'There is no user registered with that email address', 404);
  }

  const resetToken = userService.createPasswordResetToken();
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await userService.update(user);

  try {
    await sendPasswordResetEmail(user, resetToken);
    return sendSuccess(res, null, 'Password reset token sent to your email.');
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await userService.update(user);
    return sendError(res, 'Email could not be sent. Try again later.', 500);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const userToReset = await userService.findByPasswordResetToken(hashedToken);

  if (!userToReset) {
    return sendError(res, 'Reset token is invalid or has expired', 400);
  }

  userToReset.password = req.body.password;
  userToReset.passwordResetToken = undefined;
  userToReset.passwordResetExpires = undefined;
  userToReset.refreshTokens = [];
  await userService.update(userToReset);

  return sendSuccess(res, null, 'Password reset successful. Please login with your new credentials.');
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await userService.findById(req.user.id);
  return sendSuccess(res, user, 'Fetched current user successfully');
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 'Please provide current password and new password', 400);
  }

  const user = await userService.findById(req.user.id);

  if (!(await userService.comparePassword(currentPassword, user.password))) {
    return sendError(res, 'Incorrect current password', 401);
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await userService.update(user);

  // Generate new tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push(refreshToken);
  await userService.update(user);

  return sendSuccess(res, { accessToken, refreshToken }, 'Password updated successfully');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updatePassword,
};
