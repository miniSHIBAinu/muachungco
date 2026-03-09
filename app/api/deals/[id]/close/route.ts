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
        const { id } = await params;

        // In a real app, authorize the user to ensure only the creator can close it
        // const body = await request.json();
        // const { userId } = body;

        const deal = await Deal.findById(id);

        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        if (deal.status === 'closed') {
            return NextResponse.json({ error: 'Deal is already closed' }, { status: 400 });
        }

        // Generate a random 8-character discount code
        const randomCode = 'MC' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const updatedDeal = await Deal.findByIdAndUpdate(
            id,
            {
                status: 'closed',
                finalDiscountCode: randomCode
            },
            { new: true }
        ).populate('participants', 'name avatar');

        return NextResponse.json(updatedDeal);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to close deal', message: error.message },
            { status: 500 }
        );
    }
}
