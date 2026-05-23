const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema(
  {
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
      index: true
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true // 'image', 'pdf', 'zip', 'video', 'document', 'other'
    },
    mimeType: {
      type: String
    },
    fileSize: {
      type: Number,
      default: 0
    },
    storageKey: {
      type: String
    },
    isImage: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Attachment', AttachmentSchema);
