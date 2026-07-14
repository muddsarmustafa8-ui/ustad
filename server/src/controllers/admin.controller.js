const User = require('../models/User');
const Business = require('../models/Business');
const Category = require('../models/Category');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');
const CmsPage = require('../models/CmsPage');
const { logAdminAction } = require('../middleware/auditLog.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Moderator)
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const usersCount = await User.countDocuments();
  const businessesCount = await Business.countDocuments();
  const bookingsCount = await Booking.countDocuments();

  // Calculate total revenue
  const revenueAggregation = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

  // Recent business registrations
  const recentBusinesses = await Business.find()
    .populate('owner', 'fullName email')
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(5);

  // Pending verification requests
  const pendingVerifications = await Business.find({ status: 'pending', verificationDocs: { $exists: true, $not: { $size: 0 } } })
    .populate('owner', 'fullName email')
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(5);

  return sendSuccess(
    res,
    {
      stats: {
        totalUsers: usersCount,
        totalBusinesses: businessesCount,
        totalBookings: bookingsCount,
        totalRevenue,
      },
      recentBusinesses,
      pendingVerifications,
    },
    'Admin dashboard statistics fetched successfully'
  );
});

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
// @access  Private (Admin/Moderator)
const getVerifications = asyncHandler(async (req, res, next) => {
  const verifications = await Business.find({
    status: 'pending',
    verificationDocs: { $exists: true, $not: { $size: 0 } },
  })
    .populate('owner', 'fullName email')
    .populate('category', 'name')
    .sort('-createdAt');

  return sendSuccess(res, verifications, 'Fetched verification requests successfully');
});

// @desc    Get paginated users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const roleFilter = req.query.role || null;
  const searchFilter = req.query.search || null;

  const query = {};
  if (roleFilter) query.role = roleFilter;
  if (searchFilter) {
    query.$or = [
      { fullName: { $regex: searchFilter, $options: 'i' } },
      { email: { $regex: searchFilter, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').skip(skip).limit(limit);

  return sendSuccess(res, { users, total, page, limit }, 'Fetched users list successfully');
});

// @desc    Update user status (suspend, activate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return sendError(res, 'isActive status must be boolean', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  if (user.role === 'super_admin') {
    return sendError(res, 'Cannot suspend super admins', 400);
  }

  user.isActive = isActive;
  user.refreshTokens = []; // Revoke active sessions
  await user.save();

  const action = isActive ? 'Activated User' : 'Suspended User';
  await logAdminAction(req.user.id, action, user.email, req);

  return sendSuccess(res, user, `User status updated to ${isActive ? 'active' : 'suspended'}`);
});

// @desc    Get paginated businesses list
// @route   GET /api/admin/businesses
// @access  Private (Admin/Moderator)
const getBusinesses = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const statusFilter = req.query.status || null;
  const searchFilter = req.query.search || null;

  const query = {};
  if (statusFilter) query.status = statusFilter;
  if (searchFilter) {
    query.name = { $regex: searchFilter, $options: 'i' };
  }

  const total = await Business.countDocuments(query);
  const businesses = await Business.find(query)
    .populate('owner', 'fullName email')
    .populate('category', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  return sendSuccess(res, { businesses, total, page, limit }, 'Fetched businesses list successfully');
});

// @desc    Verify business verification details
// @route   PATCH /api/admin/businesses/:id/verify
// @access  Private (Admin/Moderator)
const verifyBusiness = asyncHandler(async (req, res, next) => {
  const { verificationLevel, action } = req.body; // action: approve or reject

  const business = await Business.findById(req.params.id);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  if (action === 'approve') {
    business.isVerified = true;
    business.verificationLevel = verificationLevel || 'bronze';
    business.status = 'active';
  } else if (action === 'reject') {
    business.isVerified = false;
    business.verificationLevel = 'unverified';
    business.status = 'rejected';
  } else {
    return sendError(res, 'Invalid action', 400);
  }

  await business.save();

  const auditAction = action === 'approve' ? `Verified Business (${business.verificationLevel})` : 'Rejected Business Verification';
  await logAdminAction(req.user.id, auditAction, business.name, req);

  return sendSuccess(res, business, `Business verification request ${action}d successfully`);
});

// @desc    Toggle business feature flag
// @route   PATCH /api/admin/businesses/:id/feature
// @access  Private (Admin)
const featureBusiness = asyncHandler(async (req, res, next) => {
  const { isFeatured } = req.body;

  if (typeof isFeatured !== 'boolean') {
    return sendError(res, 'isFeatured must be boolean', 400);
  }

  const business = await Business.findById(req.params.id);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  business.isFeatured = isFeatured;
  await business.save();

  const action = isFeatured ? 'Featured Business' : 'Unfeatured Business';
  await logAdminAction(req.user.id, action, business.name, req);

  return sendSuccess(res, business, `Business ${isFeatured ? 'featured' : 'unfeatured'} successfully`);
});

// @desc    Create/Update CMS static page content
// @route   PUT /api/admin/cms/:slug
// @access  Private (Admin)
const updateCmsPage = asyncHandler(async (req, res, next) => {
  const { title, content, icon } = req.body;
  const { slug } = req.params;

  let page = await CmsPage.findOne({ slug });

  if (page) {
    page.title = title || page.title;
    page.content = content || page.content;
    if (icon) page.icon = icon;
    await page.save();
  } else {
    page = await CmsPage.create({ title, slug, content, icon });
  }

  await logAdminAction(req.user.id, 'Updated CMS Page', page.title, req);

  return sendSuccess(res, page, 'CMS page updated successfully');
});

// @desc    Get CMS Pages list
// @route   GET /api/admin/cms
// @access  Private (Admin/Moderator)
const getCmsPages = asyncHandler(async (req, res, next) => {
  const pages = await CmsPage.find().sort('title');
  return sendSuccess(res, pages, 'Fetched CMS pages list');
});

// @desc    Get administrative logs history
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = asyncHandler(async (req, res, next) => {
  const logs = await AuditLog.find()
    .populate('admin', 'fullName email')
    .sort('-createdAt')
    .limit(100);

  return sendSuccess(res, logs, 'Fetched administrative audit logs successfully');
});

module.exports = {
  getDashboardStats,
  getVerifications,
  getUsers,
  updateUserStatus,
  getBusinesses,
  verifyBusiness,
  featureBusiness,
  updateCmsPage,
  getCmsPages,
  getAuditLogs,
};
