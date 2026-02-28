import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    color: { type: String, default: 'default' }, // default, yellow, green, blue, purple, red
    isPinned: { type: Boolean, default: false },
    tags: [String],
    isArchived: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model('Note', noteSchema);
