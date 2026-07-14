const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review text is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerReply: {
      type: String,
      default: '',
    },
    ownerRepliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from the same user for the same business
reviewSchema.index({ business: 1, user: 1 }, { unique: true });

// Static method to calculate rating stats on Business
reviewSchema.statics.calcAverageRatings = async function (businessId) {
  const stats = await this.aggregate([
    {
      $match: { business: businessId },
    },
    {
      $group: {
        _id: '$business',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Business').findByIdAndUpdate(businessId, {
      reviewCount: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    await mongoose.model('Business').findByIdAndUpdate(businessId, {
      reviewCount: 0,
      ratingAverage: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.business);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.business);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
