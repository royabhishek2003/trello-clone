const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema(
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
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('List', ListSchema);
