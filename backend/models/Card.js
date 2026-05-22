const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
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
      ref: 'Label',
      index: true
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
    },
    cardMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }],
    checklists: [{
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      title: { type: String, required: true },
      position: { type: Number, default: 0 },
      items: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        text: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        position: { type: Number, default: 0 },
        dueDate: { type: Date, default: null },
        hasDueTime: { type: Boolean, default: false }
      }]
    }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Card', CardSchema);
