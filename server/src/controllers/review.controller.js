const Review = require('../models/Review');
const Business = require('../models/Business');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Add a review for a business
// @route   POST /api/reviews
// @access  Private (customer)
const addReview = asyncHandler(async (req, res, next) => {
  const { review, rating, business: businessId } = req.body;

  const business = await Business.findById(businessId);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  // Prevent business owner from self-reviewing
  if (business.owner.toString() === req.user.id) {
    return sendError(res, 'You cannot review your own business', 400);
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({ business: businessId, user: req.user.id });
  if (existingReview) {
    return sendError(res, 'You have already reviewed this business. Please update your existing review.', 400);
  }

  const newReview = await Review.create({
    review,
    rating,
    business: businessId,
    user: req.user.id,
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('review:created', { businessId });
    io.to(business.owner.toString()).emit('review:created', { businessId });
  }

  return sendSuccess(res, newReview, 'Review submitted successfully', 201);
});

// @desc    Reply to a review as the business owner
// @route   PUT /api/reviews/:id/reply
// @access  Private (business_owner, admin, super_admin)
const replyToReview = asyncHandler(async (req, res, next) => {
  const { reply } = req.body;

  if (!reply || !reply.trim()) {
    return sendError(res, 'Reply text is required', 400);
  }

  const review = await Review.findById(req.params.id).populate('business');
  if (!review) {
    return sendError(res, 'Review not found', 404);
  }

  const isOwner = review.business.owner.toString() === req.user.id;
  const canModerate = ['admin', 'super_admin'].includes(req.user.role);

  if (!isOwner && !canModerate) {
    return sendError(res, 'Not authorized to reply to this review', 403);
  }

  review.ownerReply = reply.trim();
  review.ownerRepliedAt = new Date();
  await review.save();

  return sendSuccess(res, review, 'Review reply saved successfully');
});

// @desc    Get all reviews of a business
// @route   GET /api/reviews/business/:businessId
// @access  Public
const getBusinessReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ business: req.params.businessId })
    .populate('user', 'fullName avatar')
    .sort('-createdAt');

  return sendSuccess(res, reviews, 'Fetched reviews successfully');
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (customer, admin)
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return sendError(res, 'Review not found', 404);
  }

  // Authorize deletion
  if (review.user.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this review', 403);
  }

  await review.deleteOne(); // Triggers post-remove middleware

  return sendSuccess(res, null, 'Review deleted successfully');
});

module.exports = {
  addReview,
  getBusinessReviews,
  deleteReview,
  replyToReview,
};
