const OrgSubscription = require('../models/OrgSubscription');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const { sendSubscriptionEmail } = require('../services/emailService');
const { getAvailableCount } = require('../services/orgLimitService');

// @desc    Check subscription status
// @route   GET /api/subscriptions/check
// @access  Private
const checkSubscriptionStatus = async (req, res) => {
  try {
    const { orgId } = req.query;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const orgSubscription = await OrgSubscription.findOne({ orgId });
    const availableCount = await getAvailableCount(orgId);

    if (!orgSubscription) {
      return res.json({ isPro: false, availableCount });
    }

    const isValid =
      orgSubscription.status === 'active' &&
      orgSubscription.currentPeriodEnd &&
      orgSubscription.currentPeriodEnd.getTime() > Date.now();

    res.json({
      isPro: isValid,
      subscription: orgSubscription,
      availableCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create Razorpay order for subscription upgrade
// @route   POST /api/subscriptions/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orgId } = req.body;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Upgrade amount: 1499.00 INR (149900 paise)
    const amount = 149900; 
    const currency = 'INR';
    const receipt = `receipt_org_${orgId}_${Date.now()}`;
    const notes = { orgId: orgId.toString(), userId: req.user._id.toString() };

    const razorpayOrder = await createRazorpayOrder(amount, currency, receipt, notes);

    // Track order creation inside the DB
    let subscription = await OrgSubscription.findOne({ orgId });
    if (subscription) {
      subscription.razorpayOrderId = razorpayOrder.id;
      subscription.status = 'pending';
      await subscription.save();
    } else {
      subscription = new OrgSubscription({
        orgId,
        razorpayOrderId: razorpayOrder.id,
        status: 'pending'
      });
      await subscription.save();
    }

    res.status(201).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify Razorpay payment signature and activate subscription
// @route   POST /api/subscriptions/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orgId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orgId) {
      return res.status(400).json({ error: 'Payment parameters are incomplete' });
    }

    // Verify cryptographic signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return res.status(400).json({ error: 'Cryptographic signature verification failed' });
    }

    // Set expiry to 30 days from now
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await OrgSubscription.findOne({ orgId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription tracker not found for this order' });
    }

    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpayCustomerId = `cust_${req.user._id}`;
    subscription.status = 'active';
    subscription.currentPeriodEnd = currentPeriodEnd;
    await subscription.save();

    const org = await Organization.findById(orgId);
    
    // Dispatch transactional success email
    if (req.user.email) {
      await sendSubscriptionEmail(
        req.user.email,
        org ? org.name : 'Your Workspace',
        razorpay_payment_id,
        149900
      );
    }

    res.json({
      success: true,
      message: 'Payment verified and Pro status activated successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Cancel active subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const { orgId } = req.body;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const subscription = await OrgSubscription.findOne({ orgId });
    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription has been cancelled successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  checkSubscriptionStatus,
  createOrder,
  verifyPayment,
  cancelSubscription
};
