import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Deal from '@/lib/models/Deal';

export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Get the deal ID from the URL
        const { id } = await params;

        // In a real app, userId comes from the session/token.
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const deal = await Deal.findById(id);

        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        if (deal.status !== 'active') {
            return NextResponse.json({ error: 'Deal is closed' }, { status: 400 });
        }

        // Check if user is already participating
        if (deal.participants.includes(userId)) {
            return NextResponse.json({ error: 'User already joined' }, { status: 400 });
        }

        // Check if deal is full (reached max people)
        const maxPeople = Math.max(...deal.milestones.map((m: any) => m.minParticipants));
        if (deal.participants.length >= maxPeople) {
            return NextResponse.json({ error: 'Deal is full' }, { status: 400 });
        }

        // Atomic update to add user to participants
        const updatedDeal = await Deal.findByIdAndUpdate(
            id,
            { $addToSet: { participants: userId } },
            { new: true }
        ).populate('participants', 'name avatar');

        return NextResponse.json(updatedDeal);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to join deal', message: error.message },
            { status: 500 }
        );
    }
}
