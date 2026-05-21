const express = require('express');
const { body } = require('express-validator');
const {
  checkSubscriptionStatus,
  createOrder,
  verifyPayment,
  cancelSubscription
} = require('../controllers/subscriptionController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/check', checkSubscriptionStatus);

router.post(
  '/create-order',
  [body('orgId', 'Organization ID is required').notEmpty()],
  validate,
  createOrder
);

router.post(
  '/verify-payment',
  [
    body('razorpay_order_id', 'Order ID is required').notEmpty(),
    body('razorpay_payment_id', 'Payment ID is required').notEmpty(),
    body('razorpay_signature', 'Signature is required').notEmpty(),
    body('orgId', 'Organization ID is required').notEmpty()
  ],
  validate,
  verifyPayment
);

router.post(
  '/cancel',
  [body('orgId', 'Organization ID is required').notEmpty()],
  validate,
  cancelSubscription
);

module.exports = router;
