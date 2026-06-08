const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'SUSPEND_USER',
        'ACTIVATE_USER',
        'DELETE_USER',
        'UPDATE_ROLE',
        'DELETE_COURSE',
        'UPDATE_SETTINGS',
        'MODERATE_CONTENT',
      ],
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetType: {
      type: String,
      enum: ['USER', 'COURSE', 'CONTENT', 'SETTINGS'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason must not exceed 500 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
