const OrgSubscription = require('../models/OrgSubscription');

const checkSubscription = async (orgId) => {
  if (!orgId) return false;

  const orgSubscription = await OrgSubscription.findOne({ orgId });

  if (!orgSubscription) {
    return false;
  }

  const isValid =
    orgSubscription.razorpayCustomerId &&
    orgSubscription.status === 'active' &&
    orgSubscription.currentPeriodEnd &&
    orgSubscription.currentPeriodEnd.getTime() > Date.now();

  return !!isValid;
};

module.exports = { checkSubscription };
