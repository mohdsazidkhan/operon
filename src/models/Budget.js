import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    fiscalYear: { type: String, required: true },
    period: { type: String, enum: ['monthly', 'quarterly', 'annual'], default: 'annual' },
    categories: [{
        name: String,
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        variance: { type: Number, default: 0 },
    }],
    totalAllocated: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'approved', 'active', 'closed'], default: 'draft' },
    notes: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
