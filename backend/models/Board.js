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
    imageId: {
      type: String,
      required: true
    },
    imageThumbUrl: {
      type: String,
      required: true
    },
    imageFullUrl: {
      type: String,
      required: true
    },
    imageUserName: {
      type: String,
      required: true
    },
    imageLinkHTML: {
      type: String,
      required: true
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
