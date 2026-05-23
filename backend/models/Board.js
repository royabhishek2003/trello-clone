const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    // Legacy image fields - kept for backward compatibility
    imageId: {
      type: String,
    },
    imageThumbUrl: {
      type: String,
    },
    imageFullUrl: {
      type: String,
    },
    imageUserName: {
      type: String,
    },
    imageLinkHTML: {
      type: String,
    },
    // New Advanced Background System
    backgroundType: {
      type: String,
      enum: ['color', 'gradient', 'image'],
      default: 'image'
    },
    backgroundValue: {
      type: String
    },
    backgroundThumbnail: {
      type: String
    },
    backgroundMeta: {
      type: Object
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Board', BoardSchema);
