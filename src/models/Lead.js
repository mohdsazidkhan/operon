import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    company: { type: String },
    position: { type: String },
    source: { type: String, enum: ['website', 'referral', 'linkedin', 'email', 'cold_call', 'event', 'other'], default: 'website' },
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'], default: 'new' },
    score: { type: Number, default: 0, min: 0, max: 100 },
    value: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    tags: [{ type: String }],
    notes: [{ content: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
    activities: [{
        type: { type: String, enum: ['call', 'email', 'meeting', 'note', 'task'] },
        description: String,
        date: Date,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
    nextFollowUp: { type: Date },
    industry: { type: String },
    convertedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
