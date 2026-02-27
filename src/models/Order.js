import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    type: { type: String, enum: ['purchase', 'sale'], default: 'sale' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: Number
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'partially_paid', 'paid', 'refunded'], default: 'unpaid' },
    notes: String,
    shippingAddress: { street: String, city: String, state: String, country: String, zip: String },
    billingAddress: { street: String, city: String, state: String, country: String, zip: String },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        this.orderNumber = `ORD-${Date.now()}`;
    }
    next();
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
