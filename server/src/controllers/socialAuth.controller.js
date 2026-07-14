const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken } = require('../services/token.service');

const processSocialUser = async (profile) => {
  const { email, fullName, provider, providerId, avatar, phone, role } = profile;
  if (!email) {
    throw new Error('Email is required for social login');
  }

  let user = await User.findOne({ email });
  if (!user) {
    const password = crypto.randomBytes(32).toString('hex');
    user = await User.create({
      fullName,
      email,
      phone: phone || '',
      avatar: avatar || '',
      role: role || 'customer',
      provider,
      providerId,
      isEmailVerified: true,
      password,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshTokens.push(refreshToken);
  await user.save({ validateBeforeSave: false });

  user.password = undefined;
  return { user, accessToken, refreshToken };
};

const googleLogin = asyncHandler(async (req, res, next) => {
  const { idToken, role } = req.body;
  if (!idToken) {
    return sendError(res, 'Google ID token is required', 400);
  }

  const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const response = await axios.get(googleUrl);
  if (response.status !== 200) {
    return sendError(res, 'Invalid Google token', 401);
  }

  const data = response.data;
  const profile = {
    email: data.email,
    fullName: data.name || data.email,
    provider: 'google',
    providerId: data.sub,
    avatar: data.picture,
    phone: data.phone_number || '',
    role,
  };

  const authData = await processSocialUser(profile);
  return sendSuccess(res, authData, 'Logged in with Google successfully');
});

const facebookLogin = asyncHandler(async (req, res, next) => {
  const { accessToken, userID, role } = req.body;
  if (!accessToken || !userID) {
    return sendError(res, 'Facebook access token and user ID are required', 400);
  }

  const fbUrl = `https://graph.facebook.com/${encodeURIComponent(userID)}?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`;
  const response = await axios.get(fbUrl);
  if (response.status !== 200) {
    return sendError(res, 'Invalid Facebook token', 401);
  }

  const data = response.data;
  const profile = {
    email: data.email,
    fullName: data.name || data.email,
    provider: 'facebook',
    providerId: data.id,
    avatar: data.picture?.data?.url || '',
    phone: '',
    role,
  };

  const authData = await processSocialUser(profile);
  return sendSuccess(res, authData, 'Logged in with Facebook successfully');
});

module.exports = {
  googleLogin,
  facebookLogin,
};
