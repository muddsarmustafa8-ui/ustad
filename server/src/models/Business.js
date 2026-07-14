const mongoose = require('mongoose');
const slugify = require('slugify');
const { VERIFICATION_LEVELS, BUSINESS_STATUS } = require('../config/constants');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
});

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Business description is required'],
    },
    tagline: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    whatsapp: String,
    email: String,
    website: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
    },
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: 'Pakistan' },
      postalCode: String,
      googleMapsUrl: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: [0, 0], // [lng, lat]
        },
      },
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    establishedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    highlights: [String],
    about: {
      introduction: String,
      mission: String,
      vision: String,
      whyChooseUs: String,
      businessStory: String,
      professionalExperience: String,
    },
    serviceAreas: {
      cities: [String],
      areas: [String],
      homeServiceRadius: Number,
      onlineServiceAvailable: { type: Boolean, default: false },
    },
    workingHours: [
      {
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    logo: {
      type: String,
      default: '',
    },
    coverImages: [String],
    gallery: [String],
    teamMembers: [
      {
        name: String,
        position: String,
        photo: String,
        experience: String,
        skills: [String],
        contactInfo: String,
      },
    ],
    verificationLevel: {
      type: String,
      enum: Object.values(VERIFICATION_LEVELS),
      default: VERIFICATION_LEVELS.UNVERIFIED,
    },
    verificationDocs: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(BUSINESS_STATUS),
      default: BUSINESS_STATUS.PENDING,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above 0'],
      max: [5, 'Rating must be below 5'],
      set: val => Math.round(val * 10) / 10,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
    },
    tags: [String],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    packages: [
      {
        name: String,
        includedServices: [String],
        price: Number,
        discount: Number,
        duration: Number,
        features: [String],
      },
    ],
    branches: [branchSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
businessSchema.index({ 'address.coordinates': '2dsphere' });
businessSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Slugify pre-save hook
businessSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

// Virtual populate for services
businessSchema.virtual('servicesList', {
  ref: 'Service',
  foreignField: 'business',
  localField: '_id',
});

const Business = mongoose.model('Business', businessSchema);
module.exports = Business;
