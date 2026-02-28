import mongoose from 'mongoose';

const creditNoteSchema = new mongoose.Schema({
    creditNoteNumber: { type: String, unique: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    items: [{
        description: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    reason: { type: String },
    status: { type: String, enum: ['draft', 'issued', 'applied', 'void'], default: 'draft' },
    issuedDate: { type: Date, default: Date.now },
    notes: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

creditNoteSchema.pre('save', function (next) {
    if (!this.creditNoteNumber) {
        this.creditNoteNumber = `CN-${Date.now()}`;
    }
    next();
});

export default mongoose.models.CreditNote || mongoose.model('CreditNote', creditNoteSchema);
