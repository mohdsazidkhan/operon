import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    resume: { type: String },
    coverLetter: { type: String },
    status: { type: String, enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'], default: 'applied' },
    interviewDate: { type: Date },
    notes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    appliedAt: { type: Date, default: Date.now },
});

const recruitmentSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    departmentName: { type: String },
    description: { type: String },
    requirements: { type: String },
    type: { type: String, enum: ['full_time', 'part_time', 'contract', 'intern'], default: 'full_time' },
    location: { type: String },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    status: { type: String, enum: ['open', 'interviewing', 'closed', 'on_hold'], default: 'open' },
    postedDate: { type: Date, default: Date.now },
    closingDate: { type: Date },
    positions: { type: Number, default: 1 },
    applications: [applicationSchema],
    hiringManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Recruitment || mongoose.model('Recruitment', recruitmentSchema);
