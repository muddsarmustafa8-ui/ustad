const Booking = require('../models/Booking');
const Business = require('../models/Business');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get Business Metrics
// @route   GET /api/analytics/business/:businessId
// @access  Private (business_owner)
const getBusinessAnalytics = asyncHandler(async (req, res, next) => {
  const business = await Business.findById(req.params.businessId);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  if (business.owner.toString() !== req.user.id && req.user.role !== 'super_admin') {
    return sendError(res, 'Not authorized', 403);
  }

  const totalBookings = await Booking.countDocuments({ business: req.params.businessId });
  const pendingBookings = await Booking.countDocuments({ business: req.params.businessId, status: 'pending' });
  const completedBookings = await Booking.countDocuments({ business: req.params.businessId, status: 'completed' });
  const cancelledBookings = await Booking.countDocuments({ business: req.params.businessId, status: 'cancelled' });

  // Calculate earnings
  const earningsAgg = await Booking.aggregate([
    { $match: { business: business._id, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

  return sendSuccess(
    res,
    {
      metrics: {
        views: business.viewCount,
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalEarnings,
      },
    },
    'Business metrics fetched successfully'
  );
});

module.exports = {
  getBusinessAnalytics,
};
