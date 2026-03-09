import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Deal from '@/lib/models/Deal';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('muachung_session')?.value;

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Fetch deals created by user or joined by user
        const dealsDocs = await Deal.find({
            $or: [{ creatorId: sessionCookie }, { participants: sessionCookie }]
        })
            .populate('creatorId', 'name avatar')
            .sort({ createdAt: -1 })
            .lean();

        // Map to the frontend expected Deal format
        const activeDeals = dealsDocs.map((d: any) => {
            return {
                id: d._id.toString(),
                creator: {
                    id: d.creatorId?._id?.toString() || '',
                    name: d.creatorId?.name || 'User',
                    avatar: d.creatorId?.avatar || ''
                },
                product: {
                    id: 'p_' + d._id,
                    name: d.productName,
                    image: d.productImage,
                    originalPrice: 100000
                },
                milestones: d.milestones.map((m: any) => ({
                    requiredUsers: m.minParticipants,
                    discountPercent: m.discountPercent
                })),
                deadline: d.deadline,
                status: d.status,
                participants: d.participants.map((p: any) => p.toString()),
                currentUsers: d.participants?.length || 0,
                finalDiscountCode: d.finalDiscountCode
            };
        });

        return NextResponse.json(activeDeals);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch deals', message: error.message },
            { status: 500 }
        );
    }
}
