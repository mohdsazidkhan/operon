import mongoose from 'mongoose';

const vaultFileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    folder: { type: String, default: 'root' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    isPublic: { type: Boolean, default: false },
    tags: [String],
}, { timestamps: true });

export default mongoose.models.VaultFile || mongoose.model('VaultFile', vaultFileSchema);
