import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true },
    description: { type: String },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    budget: { type: Number, default: 0 },
    headcount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

departmentSchema.pre('save', function (next) {
    if (!this.code) {
        this.code = `DEPT-${Date.now()}`;
    }
    next();
});

export default mongoose.models.Department || mongoose.model('Department', departmentSchema);
