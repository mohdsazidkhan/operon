import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
    title: { type: String, required: true },
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    stage: {
        type: String,
        enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
        default: 'prospecting',
    },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    expectedCloseDate: { type: Date },
    actualCloseDate: { type: Date },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: Number
    }],
    notes: [{
        content: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    tags: [String],
    lostReason: { type: String },
    order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Deal || mongoose.model('Deal', dealSchema);
