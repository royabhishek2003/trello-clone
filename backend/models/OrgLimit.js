const mongoose = require('mongoose');

const OrgLimitSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('OrgLimit', OrgLimitSchema);
