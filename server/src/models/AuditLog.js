const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "Verified Business", "Suspended User", "Updated CMS Page"
    },
    target: {
      type: String,
      required: true, // e.g. Business Name, User Email, etc.
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
