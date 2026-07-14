const Business = require('../models/Business');
const Category = require('../models/Category');
const { BUSINESS_STATUS } = require('../config/constants');
const { generateUniqueSlug } = require('../services/slug.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Create a business
// @route   POST /api/businesses
// @access  Private (business_owner, super_admin)
const createBusiness = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    tagline,
    category,
    phone,
    whatsapp,
    email,
    website,
    socialLinks,
    address,
    yearsOfExperience,
    establishedYear,
    highlights,
    about,
    serviceAreas,
    workingHours,
    logo,
    coverImages,
    gallery,
    teamMembers,
    faqs,
    packages,
    branches,
    tags,
  } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return sendError(res, 'Category does not exist', 400);
  }

  const slug = await generateUniqueSlug(name, Business);

  const business = await Business.create({
    name,
    slug,
    description,
    tagline,
    owner: req.user.id,
    category,
    phone,
    whatsapp,
    email,
    website,
    socialLinks,
    address,
    yearsOfExperience,
    establishedYear,
    highlights,
    about,
    serviceAreas,
    workingHours,
    logo,
    coverImages,
    gallery,
    teamMembers,
    faqs,
    packages,
    branches,
    tags,
    status: BUSINESS_STATUS.ACTIVE,
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('business:created', { businessId: business._id });
    io.to(req.user.id.toString()).emit('business:created', { businessId: business._id });
  }

  return sendSuccess(res, business, 'Business created successfully and pending review', 201);
});

// @desc    Get owner's businesses
// @route   GET /api/businesses/my
// @access  Private
const getMyBusinesses = asyncHandler(async (req, res, next) => {
  const businesses = await Business.find({ owner: req.user.id }).populate('category');
  return sendSuccess(res, businesses, 'Fetched your businesses successfully');
});

// @desc    Get business details by slug
// @route   GET /api/businesses/:slug
// @access  Public
const getBusinessBySlug = asyncHandler(async (req, res, next) => {
  const business = await Business.findOne({ slug: req.params.slug })
    .populate('category')
    .populate('owner', 'fullName email phone avatar')
    .populate({
      path: 'servicesList',
      match: { isActive: true }
    });

  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  // Increment view count (non-blocking)
  business.viewCount += 1;
  await business.save({ validateBeforeSave: false });

  return sendSuccess(res, business, 'Fetched business details successfully');
});

// @desc    Update business details
// @route   PUT /api/businesses/:id
// @access  Private (business_owner, super_admin)
const updateBusiness = asyncHandler(async (req, res, next) => {
  const updates = req.body;
  
  // Clean restricted administrative fields
  delete updates.owner;
  delete updates.isVerified;
  delete updates.isFeatured;
  delete updates.verificationLevel;
  delete updates.status;

  if (updates.address && typeof updates.address === 'object') {
    const address = { ...(updates.address || {}) };
    if (address.coordinates && Array.isArray(address.coordinates.coordinates)) {
      address.coordinates.coordinates = address.coordinates.coordinates.map((value) => Number(value));
    }
    updates.address = address;
  }

  if (updates.yearsOfExperience !== undefined) {
    updates.yearsOfExperience = Number(updates.yearsOfExperience) || 0;
  }

  if (updates.establishedYear !== undefined) {
    updates.establishedYear = Number(updates.establishedYear) || undefined;
  }

  const business = await Business.findById(req.params.id);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  if (business.owner.toString() !== req.user.id && req.user.role !== 'super_admin') {
    return sendError(res, 'You are not authorized to update this business', 403);
  }

  if (updates.name && updates.name !== business.name) {
    updates.slug = await generateUniqueSlug(updates.name, Business);
  }

  const updatedBusiness = await Business.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('category');

  return sendSuccess(res, updatedBusiness, 'Business updated successfully');
});

// @desc    Submit verification documents
// @route   POST /api/businesses/:id/verify
// @access  Private (business_owner)
const submitVerification = asyncHandler(async (req, res, next) => {
  const { verificationDocs } = req.body; // Array of document URLs

  if (!verificationDocs || !Array.isArray(verificationDocs) || verificationDocs.length === 0) {
    return sendError(res, 'Please provide verification documents', 400);
  }

  const business = await Business.findById(req.params.id);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  if (business.owner.toString() !== req.user.id) {
    return sendError(res, 'You are not authorized to manage this business', 403);
  }

  business.verificationDocs = verificationDocs;
  business.status = 'pending'; // Reset status to pending review
  await business.save();

  return sendSuccess(res, business, 'Verification documents submitted successfully');
});

// @desc    Track click event (calls, whatsapp, website redirect clicks)
// @route   POST /api/businesses/:id/track
// @access  Public
const trackAction = asyncHandler(async (req, res, next) => {
  const { actionType } = req.body; // e.g. "phone", "whatsapp", "website"
  
  // Future extension: log this into a BusinessAnalytics collection
  return sendSuccess(res, { tracked: true, actionType }, 'Interaction tracked successfully');
});

module.exports = {
  createBusiness,
  getMyBusinesses,
  getBusinessBySlug,
  updateBusiness,
  submitVerification,
  trackAction,
};
