import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
    sender: {
        name: String,
        email: { type: String, required: true }
    },
    recipients: [{
        name: String,
        email: { type: String, required: true }
    }],
    subject: { type: String, required: true },
    content: { type: String, required: true },
    snippet: { type: String },
    folder: { type: String, enum: ['inbox', 'sent', 'drafts', 'trash', 'spam'], default: 'inbox' },
    isRead: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    attachments: [{
        name: String,
        size: Number,
        type: String,
        url: String
    }],
    labels: [String],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Email || mongoose.model('Email', emailSchema);
