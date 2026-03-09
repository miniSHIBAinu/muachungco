import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Deal from '@/lib/models/Deal';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        const deal = await Deal.findById(id)
            .populate('creatorId', 'name avatar zaloId')
            .populate('participants', 'name avatar zaloId');

        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        return NextResponse.json(deal);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch deal', message: error.message },
            { status: 500 }
        );
    }
}
