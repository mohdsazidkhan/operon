import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
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
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
    dueDate: { type: Date, required: true },
    issuedDate: { type: Date, default: Date.now },
    notes: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

invoiceSchema.pre('save', function (next) {
    if (!this.invoiceNumber) {
        this.invoiceNumber = `INV-${Date.now()}`;
    }
    next();
});

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
