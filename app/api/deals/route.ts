import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Deal from '@/lib/models/Deal';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Populate creator and participants to get their names and avatars
        const deals = await Deal.find({ status: 'active' })
            .populate('creatorId', 'name avatar')
            .populate('participants', 'name avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json(deals);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch deals', message: error.message },
            { status: 500 }
        );
    }
}

import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('muachung_session')?.value;
        if (!sessionCookie) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Securely inject creator ID from session
        body.creatorId = sessionCookie;

        // Auto-join the creator as the first participant
        if (!body.participants) body.participants = [];
        body.participants.push(sessionCookie);

        const newDeal = await Deal.create(body);

        return NextResponse.json(newDeal, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to create deal', message: error.message },
            { status: 500 }
        );
    }
}
