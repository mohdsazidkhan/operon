import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['general', 'urgent', 'event', 'policy', 'celebration'], default: 'general' },
    audience: { type: String, enum: ['all', 'department', 'role'], default: 'all' },
    audienceValue: { type: String }, // department name or role name if audience is not 'all'
    isPinned: { type: Boolean, default: false },
    expiresAt: { type: Date },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
    reads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
