const Business = require('../models/Business');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getMarketplaceHome = asyncHandler(async (req, res, next) => {
  const [featuredBusinesses, recentBusinesses, topRatedBusinesses, trendingServices, latestReviews] = await Promise.all([
    Business.find({ status: 'active', isFeatured: true })
      .populate('category', 'name icon slug')
      .sort('-createdAt')
      .limit(6),
    Business.find({ status: 'active' })
      .populate('category', 'name icon slug')
      .sort('-createdAt')
      .limit(6),
    Business.find({ status: 'active' })
      .populate('category', 'name icon slug')
      .sort({ ratingAverage: -1, reviewCount: -1, createdAt: -1 })
      .limit(6),
    Service.find({ isActive: true })
      .populate({ path: 'business', select: 'name slug category', populate: { path: 'category', select: 'name icon slug' } })
      .populate('category', 'name icon slug')
      .sort('-createdAt')
      .limit(6),
    Review.find()
      .populate('user', 'fullName avatar')
      .populate({ path: 'business', select: 'name slug category', populate: { path: 'category', select: 'name icon slug' } })
      .sort('-createdAt')
      .limit(6),
  ]);

  const popularCategories = await Category.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'businesses',
        localField: '_id',
        foreignField: 'category',
        as: 'businesses',
      },
    },
    { $addFields: { businessCount: { $size: '$businesses' } } },
    { $sort: { businessCount: -1, createdAt: -1 } },
    { $limit: 12 },
    { $project: { businesses: 0 } },
  ]);

  return sendSuccess(
    res,
    {
      featuredBusinesses,
      popularCategories,
      recentBusinesses,
      topRatedBusinesses,
      trendingServices,
      latestReviews,
    },
    'Marketplace home feed fetched successfully'
  );
});

module.exports = {
  getMarketplaceHome,
};