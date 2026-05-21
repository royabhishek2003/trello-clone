const mongoose = require('mongoose');

const OrgSubscriptionSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayCustomerId: {
      type: String,
      sparse: true
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true
    },
    razorpayOrderId: {
      type: String,
      sparse: true
    },
    razorpayPaymentId: {
      type: String,
      sparse: true
    },
    status: {
      type: String,
      default: 'inactive'
    },
    currentPeriodEnd: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('OrgSubscription', OrgSubscriptionSchema);
