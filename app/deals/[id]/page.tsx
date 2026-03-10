import type { Metadata, ResolvingMetadata } from 'next'
import DealDetailClient from './DealDetailClient'
import dbConnect from '@/lib/db'
import Deal from '@/lib/models/Deal'

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    try {
        await dbConnect();
        const deal = await Deal.findById(id).lean();

        if (!deal) {
            return {
                title: 'Deal Không Tồn Tại - Mua Chung Co'
            }
        }

        // Calculate maximum discount percentage
        const milestones = deal.milestones || [];
        const maxDiscount = milestones.length > 0
            ? Math.max(...milestones.map((m: any) => m.discountPercent))
            : 0;

        const title = `Giảm đến ${maxDiscount}%: ${deal.productName}`;
        const description = `Tham gia mua chung ${deal.productName} để nhận mã giảm giá lên đến ${maxDiscount}%. Càng đông càng rẻ!`;
        const domain = process.env.NEXT_PUBLIC_APP_URL || 'https://muachungco.vercel.app';

        // Using our newly created dynamic OG endpoint
        const ogImageUrl = `${domain}/api/og?title=${encodeURIComponent(deal.productName)}&discount=${maxDiscount}&image=${encodeURIComponent(deal.productImage)}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [ogImageUrl],
            },
        }
    } catch (error) {
        return {
            title: 'Mua Chung Co - Mua Chung Chiết Khấu Cao'
        }
    }
}

export default function Page({ params }: Props) {
    // We simply pass the promise to the client component that resolves it with React.use()
    return <DealDetailClient params={params} />
}
