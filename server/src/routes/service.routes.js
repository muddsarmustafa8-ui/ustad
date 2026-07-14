const express = require('express');
const {
  createService,
  getBusinessServices,
  updateService,
  deleteService,
} = require('../controllers/service.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/business/:businessId', getBusinessServices);

// Protected routes (requires login)
router.use(protect);

router.post('/', restrictTo('business_owner', 'super_admin'), createService);
router.put('/:id', restrictTo('business_owner', 'super_admin'), updateService);
router.delete('/:id', restrictTo('business_owner', 'super_admin'), deleteService);

module.exports = router;
