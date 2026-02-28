import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema({
    poNumber: { type: String, unique: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String },
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        sku: String,
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'sent', 'confirmed', 'received', 'partial', 'cancelled'], default: 'draft' },
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    receivedDate: { type: Date },
    paymentTerms: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

purchaseOrderSchema.pre('save', function (next) {
    if (!this.poNumber) this.poNumber = `PO-${Date.now()}`;
    next();
});

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);
