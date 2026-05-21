const express = require('express');
const { verifyWebhookSignature } = require('../services/razorpayService');
const OrgSubscription = require('../models/OrgSubscription');
const Organization = require('../models/Organization');

const router = express.Router();

// NOTE: This route should use express.raw({ type: 'application/json' }) as middleware
// so that process.env.RAZORPAY_WEBHOOK_SECRET works with raw payload.
router.post('/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body.toString();

  try {
    if (!signature) {
      return res.status(400).json({ error: 'Webhook signature is missing' });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({ error: 'Webhook signature validation failed' });
    }

    const event = JSON.parse(rawBody);
    console.log(`Razorpay Webhook Received Event: ${event.event}`);

    // Handle specific payment/subscription events
    if (event.event === 'order.paid') {
      const paymentPayload = event.payload.payment.entity;
      const orderPayload = event.payload.order.entity;
      const orgId = orderPayload.notes ? orderPayload.notes.orgId : null;

      if (orgId) {
        const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await OrgSubscription.findOneAndUpdate(
          { orgId },
          {
            razorpayPaymentId: paymentPayload.id,
            razorpayOrderId: orderPayload.id,
            status: 'active',
            currentPeriodEnd
          },
          { upsert: true }
        );
        console.log(`Webhook updated subscription for org: ${orgId} to active`);
      }
    } else if (event.event === 'subscription.cancelled') {
      const subscriptionPayload = event.payload.subscription.entity;
      const orgId = subscriptionPayload.notes ? subscriptionPayload.notes.orgId : null;

      if (orgId) {
        await OrgSubscription.findOneAndUpdate(
          { orgId },
          { status: 'cancelled' }
        );
        console.log(`Webhook updated subscription for org: ${orgId} to cancelled`);
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing failure:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
