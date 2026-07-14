const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBusinessBookings,
  updateBookingStatus,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // all booking operations require authentication

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/business/:businessId', getBusinessBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
