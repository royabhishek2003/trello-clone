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
    },
    labels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label'
    }],
    startDate: {
      type: Date,
      default: null
    },
    dueDate: {
      type: Date,
      default: null,
      index: true
    },
    isDateComplete: {
      type: Boolean,
      default: false
    },
    hasDueTime: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Card', CardSchema);
