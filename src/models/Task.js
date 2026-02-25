import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in_progress', 'review', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    completedAt: { type: Date },
    module: { type: String, enum: ['crm', 'erp', 'hrms', 'general'], default: 'general' },
    relatedTo: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String },
    tags: [String],
    attachments: [{ name: String, url: String }],
    order: { type: Number, default: 0 },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
