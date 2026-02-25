import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    location: { type: String },
    type: { type: String, enum: ['meeting', 'deadline', 'event', 'sync'], default: 'event' },
    color: { type: String, default: 'bg-primary-500' },
    shadow: { type: String, default: 'shadow-primary-500/20' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
