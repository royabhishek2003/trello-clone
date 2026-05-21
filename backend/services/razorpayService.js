const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');

const createRazorpayOrder = async (amountInPaise, currency = 'INR', receipt = '', notes = {}) => {
  try {
    const options = {
      amount: amountInPaise, // amount in the smallest currency unit (e.g., 2000 paise = Rs 20)
      currency,
      receipt,
      notes
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error(`Razorpay Order creation failed: ${error.message}`);
  }
};

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

const verifyWebhookSignature = (body, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature
};
