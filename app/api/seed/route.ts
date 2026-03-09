import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Deal, { IMilestone } from '@/lib/models/Deal';
import User from '@/lib/models/User';
import { MOCK_DEALS } from '@/lib/mock-data';

export async function GET() {
    try {
        await dbConnect();

        // Create a mock user to be the creator
        let user = await User.findOne({ zaloId: 'seed_creator_1' });
        if (!user) {
            user = await User.create({
                zaloId: 'seed_creator_1',
                name: 'Seed Creator',
                avatar: 'https://i.pravatar.cc/150?u=seed',
            });
        }

        // Insert deals if none exist
        const count = await Deal.countDocuments();
        if (count === 0) {
            for (const mockDeal of MOCK_DEALS) {
                // Map mock data structure to Mongoose schema
                await Deal.create({
                    creatorId: user._id,
                    productName: mockDeal.product.name,
                    productImage: mockDeal.product.image,
                    milestones: mockDeal.milestones.map(m => ({
                        minParticipants: m.requiredUsers,
                        discountPercent: m.discountPercent
                    })),
                    deadline: new Date(Date.now() + mockDeal.expiresInSeconds * 1000),
                    status: 'active',
                    participants: [],
                    // Note: MOCK_DEALS has currentUsers, but participants is an array of ObjectIds. 
                    // For seeding, we'll start with empty participants or create mock participant users later.
                });
            }
            return NextResponse.json({ message: 'Seeded successfully' });
        }

        return NextResponse.json({ message: 'Database already has deals' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
