import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    paymentMethod: { type: String },
    reference: String,
    merchant: String,
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [{ name: String, url: String }],
    notes: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
