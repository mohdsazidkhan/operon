import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: {
        housing: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        meal: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
    },
    deductions: {
        tax: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 },
        pension: { type: Number, default: 0 },
        loan: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
    },
    overtime: { hours: Number, rate: Number, amount: { type: Number, default: 0 } },
    bonus: { type: Number, default: 0 },
    grossSalary: { type: Number },
    totalDeductions: { type: Number },
    netPay: { type: Number },
    status: { type: String, enum: ['draft', 'processed', 'paid'], default: 'draft' },
    paidDate: { type: Date },
    paymentMethod: { type: String },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);
