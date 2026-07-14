const Service = require('../models/Service');
const Business = require('../models/Business');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Add a service to a business
// @route   POST /api/services
// @access  Private (business_owner)
const createService = asyncHandler(async (req, res, next) => {
  const { name, description, business: businessId, price, duration, image, pricingTiers } = req.body;

  const business = await Business.findById(businessId);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  // Check ownership
  if (business.owner.toString() !== req.user.id && req.user.role !== 'super_admin') {
    return sendError(res, 'Not authorized to add services to this business', 403);
  }

  const service = await Service.create({
    name,
    description,
    business: businessId,
    category: business.category,
    price,
    duration,
    image,
    pricingTiers: pricingTiers || [],
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('service:created', { serviceId: service._id, businessId: business._id });
    io.to(business.owner.toString()).emit('service:created', { serviceId: service._id, businessId: business._id });
  }

  return sendSuccess(res, service, 'Service added successfully', 201);
});

// @desc    Get all services of a business
// @route   GET /api/services/business/:businessId
// @access  Public
const getBusinessServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find({ business: req.params.businessId, isActive: true });
  return sendSuccess(res, services, 'Fetched business services successfully');
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (business_owner)
const updateService = asyncHandler(async (req, res, next) => {
  const updates = req.body;
  delete updates.business;
  delete updates.category;

  const service = await Service.findById(req.params.id).populate('business');
  if (!service) {
    return sendError(res, 'Service not found', 404);
  }

  if (service.business.owner.toString() !== req.user.id && req.user.role !== 'super_admin') {
    return sendError(res, 'Not authorized to update this service', 403);
  }

  const updatedService = await Service.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, updatedService, 'Service updated successfully');
});

// @desc    Delete/Deactivate a service
// @route   DELETE /api/services/:id
// @access  Private (business_owner)
const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate('business');
  if (!service) {
    return sendError(res, 'Service not found', 404);
  }

  if (service.business.owner.toString() !== req.user.id && req.user.role !== 'super_admin') {
    return sendError(res, 'Not authorized to delete this service', 403);
  }

  // Deactivate instead of hard delete to preserve booking history
  service.isActive = false;
  await service.save();

  return sendSuccess(res, null, 'Service deleted successfully');
});

module.exports = {
  createService,
  getBusinessServices,
  updateService,
  deleteService,
};
