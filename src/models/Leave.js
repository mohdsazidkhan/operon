import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'casual', 'emergency'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
