const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Card', CardSchema);
