const express = require('express');
const {
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
} = require('../controllers/admin.controller');
const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { isModeratorOrAdmin, isAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

router.use(protect); // all admin endpoints require authentication

// Moderators and Admins can access dashboard, businesses, and CMS
router.get('/dashboard', isModeratorOrAdmin, getDashboardStats);
router.get('/verifications', isModeratorOrAdmin, getVerifications);
router.get('/businesses', isModeratorOrAdmin, getBusinesses);
router.patch('/businesses/:id/verify', isModeratorOrAdmin, verifyBusiness);
router.get('/cms', isModeratorOrAdmin, getCmsPages);
router.get('/categories', isAdmin, getAdminCategories);
router.post('/categories', isAdmin, createCategory);
router.put('/categories/:id', isAdmin, updateCategory);
router.patch('/categories/:id', isAdmin, updateCategory);
router.delete('/categories/:id', isAdmin, deleteCategory);

// Only Admins can manage users, feature businesses, update CMS, and read audit logs
router.get('/users', isAdmin, getUsers);
router.patch('/users/:id/status', isAdmin, updateUserStatus);
router.patch('/businesses/:id/feature', isAdmin, featureBusiness);
router.put('/cms/:slug', isAdmin, updateCmsPage);
router.get('/audit-logs', isAdmin, getAuditLogs);

module.exports = router;
