import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    period: { type: String, required: true }, // e.g. "Q1 2025"
    periodType: { type: String, enum: ['monthly', 'quarterly', 'annual'], default: 'quarterly' },
    goals: [{
        title: { type: String, required: true },
        description: String,
        targetValue: Number,
        actualValue: Number,
        weight: { type: Number, default: 1 },
        status: { type: String, enum: ['pending', 'in_progress', 'completed', 'missed'], default: 'pending' },
    }],
    ratings: {
        quality: { type: Number, min: 1, max: 5, default: 3 },
        productivity: { type: Number, min: 1, max: 5, default: 3 },
        teamwork: { type: Number, min: 1, max: 5, default: 3 },
        communication: { type: Number, min: 1, max: 5, default: 3 },
        initiative: { type: Number, min: 1, max: 5, default: 3 },
    },
    overallScore: { type: Number, min: 1, max: 5 },
    strengths: { type: String },
    improvements: { type: String },
    comments: { type: String },
    reviewerComments: { type: String },
    status: { type: String, enum: ['draft', 'submitted', 'reviewed', 'acknowledged'], default: 'draft' },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Performance || mongoose.model('Performance', performanceSchema);
