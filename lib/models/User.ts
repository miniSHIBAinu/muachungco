import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    zaloId: string;
    name: string;
    avatar?: string;
    phone?: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

const UserSchema = new Schema(
    {
        zaloId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        avatar: { type: String },
        phone: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
