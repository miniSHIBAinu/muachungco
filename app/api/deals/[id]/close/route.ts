import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Deal from '@/lib/models/Deal';
import { sendDiscountCodeZNS } from '@/lib/zns';
import { getCurrentMilestone } from '@/lib/utils';

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
        ).populate('participants', 'name avatar zaloId phone');

        // Trigger ZNS Notifications for all participants
        try {
            const participantCount = updatedDeal.participants.length;
            const currentMilestone = getCurrentMilestone(participantCount, updatedDeal.milestones);
            const discountPercent = currentMilestone?.discountPercent || 0;
            const dealUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deals/${updatedDeal._id}`;

            const znsPromises = updatedDeal.participants.map(async (user: any) => {
                const phoneOrId = user.phone || user.zaloId || "unknown";
                if (phoneOrId !== "unknown") {
                    await sendDiscountCodeZNS(phoneOrId, {
                        customerName: user.name || 'Khách hàng',
                        productName: updatedDeal.productName,
                        discountCode: updatedDeal.finalDiscountCode,
                        discountPercent: discountPercent,
                        dealUrl: dealUrl
                    });
                }
            });

            // Wait for all messages to be processed (success or fail) so Vercel doesn't kill the function early
            await Promise.allSettled(znsPromises);
        } catch (znsError) {
            console.error('[ZNS Trigger Error]', znsError);
            // Don't fail the deal close operation if ZNS fails
        }

        return NextResponse.json(updatedDeal);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to close deal', message: error.message },
            { status: 500 }
        );
    }
}
