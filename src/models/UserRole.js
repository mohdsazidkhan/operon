import mongoose from 'mongoose';

const userRoleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Optional: temporary permission grant
    expiresAt: {
        type: Date,
        default: null,
    },
    // Optional: restrict role to a specific branch/location
    branch: {
        type: String,
        default: null,
    },
    // Direct permission overrides on top of role (temporary grants)
    additionalPermissions: [{ type: String }],
    // Permissions explicitly revoked for this assignment
    revokedPermissions: [{ type: String }],

    isActive: { type: Boolean, default: true },
}, { timestamps: true });

userRoleSchema.index({ user: 1, organization: 1 });
userRoleSchema.index({ user: 1, role: 1, organization: 1 }, { unique: true });
userRoleSchema.index({ expiresAt: 1 }); // for TTL cleanup queries

// Virtual: check if this assignment is currently valid
userRoleSchema.virtual('isValid').get(function () {
    if (!this.isActive) return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
});

export default mongoose.models.UserRole || mongoose.model('UserRole', userRoleSchema);
