const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    icon: String, // Emoji or icon identifier
  },
  {
    timestamps: true,
  }
);

const CmsPage = mongoose.model('CmsPage', cmsPageSchema);
module.exports = CmsPage;
