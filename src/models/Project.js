import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dueDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
});

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'], default: 'planning' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    startDate: { type: Date },
    dueDate: { type: Date },
    completedDate: { type: Date },
    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    client: { type: String },
    tags: [String],
    milestones: [milestoneSchema],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
