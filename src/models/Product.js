import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, unique: true },
    category: { type: String },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    cost: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    unit: { type: String, default: 'pcs' },
    images: [String],
    brand: { type: String },
    barcode: { type: String },
    weight: { type: Number },
    dimensions: { length: Number, width: Number, height: Number },
    isActive: { type: Boolean, default: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    tags: [String],
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
