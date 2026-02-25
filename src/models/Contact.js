import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    position: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    avatar: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    tags: [String],
    address: { city: String, country: String },
    social: { linkedin: String, twitter: String },
    notes: [{ content: String, createdAt: { type: Date, default: Date.now } }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);
