import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        // e.g. "crm.leads.view"
    },
    module: {
        type: String,
        required: true,
        enum: ['crm', 'hrms', 'erp', 'global'],
    },
    resource: {
        type: String,
        required: true,
        // e.g. "leads"
    },
    action: {
        type: String,
        required: true,
        // e.g. "view"
    },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: true },
}, { timestamps: true });

permissionSchema.index({ module: 1 });
permissionSchema.index({ key: 1 });

export default mongoose.models.Permission || mongoose.model('Permission', permissionSchema);
