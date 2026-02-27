import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['super_admin', 'admin', 'manager', 'employee'], default: 'employee' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    department: { type: String, default: '' },
    position: { type: String, default: '' },
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
