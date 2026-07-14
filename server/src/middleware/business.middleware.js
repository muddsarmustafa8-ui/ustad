const Business = require('../models/Business');

const isBusinessOwner = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.business || req.params.id;
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only the business owner is authorized' });
    }

    req.business = business;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  isBusinessOwner,
};
