import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
    minParticipants: number;
    discountPercent: number;
}

export interface IDeal extends Document {
    creatorId: mongoose.Types.ObjectId;
    productName: string;
    productImage: string;
    milestones: IMilestone[];
    deadline: Date;
    status: 'active' | 'closed';
    participants: mongoose.Types.ObjectId[];
    finalDiscountCode?: string;
    createdAt: Date;
}

const MilestoneSchema = new Schema({
    minParticipants: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
});

const DealSchema = new Schema(
    {
        creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        productName: { type: String, required: true },
        productImage: { type: String, required: true },
        milestones: [MilestoneSchema],
        deadline: { type: Date, required: true },
        status: { type: String, enum: ['active', 'closed'], default: 'active' },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        finalDiscountCode: { type: String },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);
