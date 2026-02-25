import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
