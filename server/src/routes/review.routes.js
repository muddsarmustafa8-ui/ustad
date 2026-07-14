const express = require('express');
const { addReview, getBusinessReviews, deleteReview, replyToReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/business/:businessId', getBusinessReviews);

// Protected routes (requires login)
router.post('/', protect, addReview);
router.put('/:id/reply', protect, replyToReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
