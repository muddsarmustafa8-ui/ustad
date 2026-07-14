const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Business = require('../models/Business');
const { sendBookingConfirmationEmail } = require('../services/email.service');
const { sendNotification } = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (customer)
const createBooking = asyncHandler(async (req, res, next) => {
  const { service: serviceId, pricingTierName, bookingDate, timeSlot, notes } = req.body;

  const service = await Service.findById(serviceId).populate('business');
  if (!service) {
    return sendError(res, 'Service not found', 404);
  }

  // Calculate pricing based on selected tier
  let price = service.price;
  if (pricingTierName && service.pricingTiers && service.pricingTiers.length > 0) {
    const tier = service.pricingTiers.find(t => t.name.toLowerCase() === pricingTierName.toLowerCase());
    if (tier) price = tier.price;
  }

  const booking = await Booking.create({
    customer: req.user.id,
    business: service.business._id,
    service: serviceId,
    pricingTier: pricingTierName || null,
    price,
    bookingDate: new Date(bookingDate),
    timeSlot,
    notes,
  });

  // Notify Business Owner in background
  try {
    const io = req.app.get('io');
    await sendNotification(
      service.business.owner,
      'New Booking Received',
      `You have a new booking from ${req.user.fullName} for service "${service.name}".`,
      'booking',
      booking._id,
      io
    );
  } catch (err) {
    console.error('❌ Socket notification failed:', err.message);
  }

  // Send email confirmation
  try {
    await sendBookingConfirmationEmail(req.user, booking, service.business.name, service.name);
  } catch (err) {
    console.error('❌ Email confirmation failed:', err.message);
  }

  return sendSuccess(res, booking, 'Booking created successfully', 201);
});

// @desc    Get customer bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ customer: req.user.id })
    .populate('business', 'name logo slug phone address')
    .populate('service', 'name image description')
    .sort('-bookingDate');

  return sendSuccess(res, bookings, 'Fetched your bookings successfully');
});

// @desc    Get business bookings
// @route   GET /api/bookings/business/:businessId
// @access  Private (business_owner)
const getBusinessBookings = asyncHandler(async (req, res, next) => {
  const business = await Business.findById(req.params.businessId);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  if (business.owner.toString() !== req.user.id && req.user.role !== 'super_admin') {
    return sendError(res, 'Not authorized to view bookings for this business', 403);
  }

  const bookings = await Booking.find({ business: req.params.businessId })
    .populate('customer', 'fullName email phone avatar')
    .populate('service', 'name image price duration')
    .sort('-bookingDate');

  return sendSuccess(res, bookings, 'Fetched business bookings successfully');
});

// @desc    Update booking status (confirm, complete, cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private (customer, business_owner)
const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body; // confirmed, completed, cancelled
  
  if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
    return sendError(res, 'Invalid booking status', 400);
  }

  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'fullName email phone avatar')
    .populate('service', 'name')
    .populate({
      path: 'business',
      populate: { path: 'owner' }
    });

  if (!booking) {
    return sendError(res, 'Booking not found', 404);
  }

  // Authorization checks
  const isOwner = booking.business.owner._id.toString() === req.user.id;
  const isCustomer = booking.customer._id.toString() === req.user.id;

  if (!isOwner && !isCustomer && req.user.role !== 'super_admin') {
    return sendError(res, 'Not authorized to update this booking', 403);
  }

  // Customers can only cancel
  if (isCustomer && status !== 'cancelled') {
    return sendError(res, 'Customers can only cancel bookings', 400);
  }

  booking.status = status;
  await booking.save();

  // Send status update notifications
  try {
    const io = req.app.get('io');
    const recipient = isOwner ? booking.customer._id : booking.business.owner._id;
    const senderName = isOwner ? booking.business.name : req.user.fullName;

    await sendNotification(
      recipient,
      'Booking Status Updated',
      `Booking for "${booking.service.name}" has been ${status} by ${senderName}.`,
      'booking',
      booking._id,
      io
    );
  } catch (err) {
    console.error('❌ Socket notification failed:', err.message);
  }

  return sendSuccess(res, booking, `Booking status updated to ${status} successfully`);
});

module.exports = {
  createBooking,
  getMyBookings,
  getBusinessBookings,
  updateBookingStatus,
};
