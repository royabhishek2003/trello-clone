const express = require('express');
const { body } = require('express-validator');
const {
  checkSubscriptionStatus,
  createOrder,
  verifyPayment,
  cancelSubscription,
  mockUpgrade
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

router.post(
  '/mock-upgrade',
  [body('orgId', 'Organization ID is required').notEmpty()],
  validate,
  mockUpgrade
);

module.exports = router;
