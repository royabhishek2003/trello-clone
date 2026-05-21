const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Organization', OrganizationSchema);
