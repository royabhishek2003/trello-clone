const AuditLog = require('../models/AuditLog');

const createAuditLog = async (logData, user, orgId) => {
  try {
    const { entityId, entityType, entityTitle, action, details } = logData;
    
    if (!user) {
      console.warn('AuditLog warning: User is required to write an audit log');
      return null;
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const userImage = user.imageUrl || '';

    const auditLog = new AuditLog({
      orgId,
      action,
      entityId,
      entityType,
      entityTitle,
      userId: user._id.toString(),
      userImage,
      userName,
      details: details || ''
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
    return null;
  }
};

module.exports = { createAuditLog };
