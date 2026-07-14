const AuditLog = require('../models/AuditLog');

const logAdminAction = async (adminId, action, target, req) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await AuditLog.create({
      admin: adminId,
      action,
      target,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error(`❌ Failed to write audit log: ${error.message}`);
  }
};

module.exports = {
  logAdminAction,
};
