import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    industry: { type: String },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
    website: { type: String },
    email: { type: String },
    phone: { type: String },
    revenue: { type: Number },
    logo: { type: String },
    address: { street: String, city: String, state: String, country: String, zip: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    tags: [String],
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model('Company', companySchema);
