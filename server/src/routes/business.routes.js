const express = require('express');
const {
  createBusiness,
  getMyBusinesses,
  getBusinessBySlug,
  updateBusiness,
  submitVerification,
  trackAction,
} = require('../controllers/business.controller');
const { getBusinessAnalytics } = require('../controllers/analytics.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/profile/:slug', getBusinessBySlug);
router.post('/track/:id', trackAction);

// Protected routes (requires login)
router.use(protect);

router.post('/', restrictTo('business_owner', 'super_admin'), createBusiness);
router.get('/my', restrictTo('business_owner', 'super_admin'), getMyBusinesses);
router.put('/:id', updateBusiness);
router.post('/:id/verify', restrictTo('business_owner'), submitVerification);
router.get('/:businessId/analytics', restrictTo('business_owner', 'super_admin'), getBusinessAnalytics);

module.exports = router;
