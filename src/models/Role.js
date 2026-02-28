import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    description: { type: String, default: '' },
    module: {
        type: String,
        enum: ['crm', 'hrms', 'erp', 'global'],
        required: true,
    },
    // Direct permission keys (no DB join needed at runtime)
    permissions: [{ type: String }],

    // Inherit all permissions from parent roles first
    inheritsFrom: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
    }],

    // null = global system role; ObjectId = org-specific custom role
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
    },

    // System roles cannot be deleted, only permission-edited by super_admin
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Compound unique: same slug is reusable across orgs but unique per org (null = global)
roleSchema.index({ slug: 1, organization: 1 }, { unique: true });
roleSchema.index({ module: 1 });
roleSchema.index({ isSystem: 1 });

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
