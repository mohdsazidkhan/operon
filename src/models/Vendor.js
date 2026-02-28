import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    contactPerson: { type: String },
    address: { street: String, city: String, state: String, country: String, zip: String },
    category: { type: String, default: 'general' },
    paymentTerms: { type: String, default: 'net30' },
    taxId: { type: String },
    bankAccount: { accountName: String, accountNumber: String, bankName: String, routing: String },
    status: { type: String, enum: ['active', 'inactive', 'blacklisted'], default: 'active' },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    notes: { type: String },
    tags: [String],
    totalPurchases: { type: Number, default: 0 },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

vendorSchema.pre('save', function (next) {
    if (!this.code) this.code = `VND-${Date.now()}`;
    next();
});

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
