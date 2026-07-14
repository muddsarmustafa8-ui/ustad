const mongoose = require('mongoose');

const pricingTierSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Basic, Standard, Premium
  price: { type: Number, required: true },
  description: String,
  duration: Number, // In minutes
  features: [String],
});

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Service base price is required'],
    },
    duration: {
      type: Number, // Base duration in minutes
      required: [true, 'Service base duration is required'],
    },
    image: String,
    pricingTiers: [pricingTierSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
