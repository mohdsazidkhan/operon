import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For 1:1 chats
    channelId: { type: String }, // For group/channel chats
    text: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    attachments: [{ name: String, url: String }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
