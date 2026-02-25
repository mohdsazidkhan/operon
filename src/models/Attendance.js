import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    hoursWorked: { type: Number, default: 0 },
    status: { type: String, enum: ['present', 'absent', 'half_day', 'late', 'on_leave', 'holiday', 'weekend'], default: 'present' },
    overtime: { type: Number, default: 0 },
    notes: { type: String },
    location: { type: String, enum: ['office', 'remote', 'field'], default: 'office' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
