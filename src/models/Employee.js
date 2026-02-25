import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    employeeId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String, default: '' },
    department: { type: String, required: true },
    position: { type: String, required: true },
    employmentType: { type: String, enum: ['full_time', 'part_time', 'contract', 'intern'], default: 'full_time' },
    status: { type: String, enum: ['active', 'inactive', 'on_leave', 'terminated'], default: 'active' },
    hireDate: { type: Date, required: true },
    terminationDate: { type: Date },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    salary: { type: Number, default: 0 },
    salaryType: { type: String, enum: ['monthly', 'hourly'], default: 'monthly' },
    bankAccount: { accountName: String, accountNumber: String, bankName: String, routing: String },
    address: { street: String, city: String, state: String, country: String, zip: String },
    emergencyContact: { name: String, phone: String, relationship: String },
    documents: [{ name: String, url: String, uploadedAt: Date }],
    skills: [String],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

employeeSchema.pre('save', function (next) {
    if (!this.employeeId) {
        this.employeeId = `EMP-${Date.now()}`;
    }
    next();
});

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
