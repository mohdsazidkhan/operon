import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    logo: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
    planExpiry: { type: Date },
    seats: { type: Number, default: 5 },
    industry: { type: String, default: '' },
    website: { type: String, default: '' },
    address: {
        street: String, city: String, state: String, country: String, zip: String,
    },
    settings: {
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' },
        dateFormat: { type: String, default: 'MM/DD/YYYY' },
        fiscalYearStart: { type: Number, default: 1 },
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
