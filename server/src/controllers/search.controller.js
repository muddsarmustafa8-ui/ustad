const Business = require('../models/Business');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Search and filter businesses
// @route   GET /api/search/businesses
// @access  Public
const searchBusinesses = asyncHandler(async (req, res, next) => {
  const {
    query,
    category,
    city,
    latitude,
    longitude,
    radius, // in KM
    minRating,
    verifiedOnly,
    featuredOnly,
    sortBy, // newest, nearest, highest_rated, view_count
    page = 1,
    limit = 10,
  } = req.query;

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const pipeline = [];

  // 1. GeoNear stage (must be first if coordinates exist)
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius) || 10; // default 10km radius

    pipeline.push({
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        maxDistance: rad * 1000, // convert KM to meters
        spherical: true,
        query: { status: 'active' }, // only active businesses
      },
    });
  } else {
    // Standard match stage if not geo-searching
    pipeline.push({
      $match: { status: 'active' },
    });
  }

  // 2. Text Search stage
  if (query) {
    pipeline.push({
      $match: {
        $text: { $search: query },
      },
    });
  }

  // 3. Category Match stage
  if (category) {
    // Check if category is objectId or slug
    let categoryQuery = {};
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      categoryQuery = { category: new Object(category) };
    } else {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        categoryQuery = { category: cat._id };
      }
    }
    pipeline.push({ $match: categoryQuery });
  }

  // 4. City Match stage
  if (city) {
    pipeline.push({
      $match: {
        'address.city': { $regex: city, $options: 'i' },
      },
    });
  }

  // 5. Verified/Featured filter stages
  if (verifiedOnly === 'true') {
    pipeline.push({ $match: { isVerified: true } });
  }
  if (featuredOnly === 'true') {
    pipeline.push({ $match: { isFeatured: true } });
  }

  // 6. Rating Match stage
  if (minRating) {
    pipeline.push({
      $match: {
        ratingAverage: { $gte: parseFloat(minRating) },
      },
    });
  }

  // 7. Sort stage
  let sortStage = { $sort: { isFeatured: -1, createdAt: -1 } }; // default sort
  if (sortBy === 'newest') {
    sortStage = { $sort: { createdAt: -1 } };
  } else if (sortBy === 'highest_rated') {
    sortStage = { $sort: { ratingAverage: -1, reviewCount: -1 } };
  } else if (sortBy === 'view_count') {
    sortStage = { $sort: { viewCount: -1 } };
  } else if (sortBy === 'nearest' && latitude && longitude) {
    sortStage = { $sort: { distance: 1 } };
  }
  pipeline.push(sortStage);

  // 8. Pagination stages
  pipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [{ $skip: skip }, { $limit: parsedLimit }],
    },
  });

  const rawResults = await Business.aggregate(pipeline);
  const total = rawResults[0].metadata[0] ? rawResults[0].metadata[0].total : 0;
  const rawBusinesses = rawResults[0].data;

  // Manually populate categories for aggregation outputs
  const businesses = await Business.populate(rawBusinesses, [
    { path: 'category', select: 'name icon slug' },
  ]);

  return sendSuccess(
    res,
    {
      businesses,
      total,
      page: parsedPage,
      limit: parsedLimit,
    },
    'Businesses search results fetched successfully'
  );
});

module.exports = {
  searchBusinesses,
};
