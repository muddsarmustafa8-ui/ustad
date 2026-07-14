const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Business = require('../models/Business');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { fullName, phone, avatar } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  return sendSuccess(res, user, 'Profile updated successfully');
});

// @desc    Get bookmarked/favorite businesses
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user.id }).populate({
    path: 'business',
    populate: [
      { path: 'category' },
      { path: 'servicesList', match: { isActive: true } },
    ],
  });

  const businesses = favorites.map(fav => fav.business).filter(Boolean);
  return sendSuccess(res, businesses, 'Fetched favorite businesses successfully');
});

// @desc    Toggle bookmark for business
// @route   POST /api/users/favorites/:businessId
// @access  Private
const toggleFavorite = asyncHandler(async (req, res, next) => {
  const { businessId } = req.params;

  const business = await Business.findById(businessId);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  const existingFav = await Favorite.findOne({ user: req.user.id, business: businessId });

  if (existingFav) {
    await Favorite.findByIdAndDelete(existingFav._id);
    return sendSuccess(res, { isFavorite: false }, 'Removed from favorites');
  } else {
    await Favorite.create({ user: req.user.id, business: businessId });
    return sendSuccess(res, { isFavorite: true }, 'Added to favorites');
  }
});

module.exports = {
  updateProfile,
  getFavorites,
  toggleFavorite,
};
