const OrgLimit = require('../models/OrgLimit');
const { MAX_FREE_BOARDS } = require('../utils/constants');

const getAvailableCount = async (orgId) => {
  if (!orgId) return 0;
  
  const orgLimit = await OrgLimit.findOne({ orgId });
  if (!orgLimit) return 0;
  
  return orgLimit.count;
};

const hasAvailableCount = async (orgId) => {
  if (!orgId) return false;
  
  const count = await getAvailableCount(orgId);
  return count < MAX_FREE_BOARDS;
};

const incrementAvailableCount = async (orgId) => {
  if (!orgId) return;

  const orgLimit = await OrgLimit.findOne({ orgId });

  if (orgLimit) {
    orgLimit.count += 1;
    await orgLimit.save();
  } else {
    const newOrgLimit = new OrgLimit({ orgId, count: 1 });
    await newOrgLimit.save();
  }
};

const decreaseAvailableCount = async (orgId) => {
  if (!orgId) return;

  const orgLimit = await OrgLimit.findOne({ orgId });

  if (orgLimit) {
    if (orgLimit.count > 0) {
      orgLimit.count -= 1;
      await orgLimit.save();
    }
  } else {
    const newOrgLimit = new OrgLimit({ orgId, count: 0 });
    await newOrgLimit.save();
  }
};

module.exports = {
  getAvailableCount,
  hasAvailableCount,
  incrementAvailableCount,
  decreaseAvailableCount
};
