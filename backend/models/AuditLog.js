const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true
    },
    entityId: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ['BOARD', 'LIST', 'CARD'],
      required: true
    },
    entityTitle: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    userImage: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
