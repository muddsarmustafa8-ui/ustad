const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const businessRoutes = require('./business.routes');
const categoryRoutes = require('./category.routes');
const serviceRoutes = require('./service.routes');
const reviewRoutes = require('./review.routes');
const bookingRoutes = require('./booking.routes');
const messageRoutes = require('./message.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const socialAuthRoutes = require('./socialAuth.routes');
const searchRoutes = require('./search.routes');
const marketplaceRoutes = require('./marketplace.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/businesses', businessRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/reviews', reviewRoutes);
router.use('/bookings', bookingRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/auth/social', socialAuthRoutes);
router.use('/search', searchRoutes);
router.use('/marketplace', marketplaceRoutes);

module.exports = router;
