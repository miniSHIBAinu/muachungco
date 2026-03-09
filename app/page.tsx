import Header from "@/components/layout/Header";
import DealCard from "@/components/deals/DealCard";
import FlashBanner from "@/components/home/FlashBanner";
import CategoryRow from "@/components/home/CategoryRow";
import Link from "next/link";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Deal from "@/lib/models/Deal";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await dbConnect();

  // Fetch active deals from MongoDB
  const dealsDocs = await Deal.find({ status: "active" })
    .populate('creatorId', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();

  // Map to the frontend expected Deal format
  const activeDeals = dealsDocs.map((d: any) => {
    return {
      id: d._id.toString(),
      title: d.productName || 'Mua Chung Deal',
      productName: d.productName,
      productImage: d.productImage,
      category: 'Deal Hot',
      creator: {
        id: d.creatorId?._id?.toString() || '',
        name: d.creatorId?.name || 'User',
        avatar: d.creatorId?.avatar || ''
      },
      creatorId: d.creatorId?._id?.toString() || '',
      creatorName: d.creatorId?.name || 'User',
      product: {
        id: 'p_' + d._id, // mock product id for now
        name: d.productName,
        image: d.productImage,
        originalPrice: 100000 // mock original price
      },
      milestones: d.milestones.map((m: any) => ({
        id: m._id?.toString() || '',
        minParticipants: m.minParticipants,
        discountPercent: m.discountPercent,
        requiredUsers: m.minParticipants // Alias for backward compatibility if needed
      })),
      deadline: d.deadline,
      status: d.status,
      participants: d.participants?.map((p: any) => p.toString()) || [],
      currentUsers: d.participants?.length || 0,
      createdAt: d.createdAt || new Date(),
      shareUrl: `https://muachung.co/deals/${d._id}`
    };
  });

  // Pick most urgent deal for flash banner
  const flashDeal = [...activeDeals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  return (
    <>
      <Header />

      <main className="px-3 py-3 space-y-4">
        {/* Categories */}
        <CategoryRow />

        {/* Flash Group Deals Banner */}
        {flashDeal && <FlashBanner deal={flashDeal} />}

        {/* Hot Deals Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
              Hot Deals Near You
            </h2>
            <Link href="/my-deals" className="text-sm font-bold cursor-pointer text-[#EE4D2D]" style={{ fontFamily: "var(--font-heading)" }}>
              View All
            </Link>
          </div>

          {activeDeals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">🎪</p>
              <p className="font-medium text-sm">Chưa có deal nào. Hãy tạo deal đầu tiên!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {activeDeals.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
