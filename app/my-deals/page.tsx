'use client';

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Image from "next/image";
import { getDealStatusLabel } from "@/lib/utils";
import type { Deal } from "@/lib/types";
import Link from "next/link";
import { Share2, Clock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { shareToZalo } from "@/lib/zalo-share";

const TABS = [
    { key: "active", label: "Active" },
    { key: "closed", label: "Closed" },
] as const;

function DealListItem({ deal }: { deal: any }) {
    const maxPeople = Math.max(...deal.milestones.map((m: any) => m.requiredUsers));
    const joined = deal.currentUsers || 0;
    const percent = Math.min(100, Math.round((joined / maxPeople) * 100));

    return (
        <Link href={`/deals/${deal.id}`} className="card block p-4">
            <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                    <Image src={deal.product.image} alt={deal.product.name} fill className="object-cover" sizes="80px" />
                    <div className="discount-badge" style={{ top: 4, left: 4, fontSize: "0.6rem", padding: "2px 5px" }}>
                        -{Math.max(...deal.milestones.map((m: any) => m.discountPercent))}%
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                        {deal.product.name}
                    </p>

                    {/* Countdown */}
                    {deal.status === "active" && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={11} />
                            <span>Ends in {Math.max(0, Math.floor((deal.deadline.getTime() - Date.now()) / 3600000))}h</span>
                        </div>
                    )}

                    {/* Price */}
                    <p className="font-bold text-sm" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
                        {deal.status === "closed" ? "✓ Đã chốt" : deal.status === "expired" ? "Expired" : "Đang chạy"}
                    </p>

                    {/* Progress */}
                    <div className="space-y-1">
                        <div className="joined-bar-track">
                            <div className="joined-bar-fill" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="text-xs font-semibold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
                            {joined}/{maxPeople} Joined
                        </p>
                    </div>
                </div>
            </div>

            {/* Share action or Code info */}
            {deal.status === "closed" && deal.finalDiscountCode ? (
                <div className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200" style={{ fontFamily: "var(--font-heading)" }}>
                    <span>Mã: {deal.finalDiscountCode}</span>
                </div>
            ) : (
                <button
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof window !== 'undefined') {
                            const url = `${window.location.origin}/deals/${deal._id || deal.id}`;
                            shareToZalo(url, deal.product.name || deal.productName);
                        }
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
                    style={{ background: "var(--color-secondary)", fontFamily: "var(--font-heading)" }}
                >
                    <Share2 size={13} />
                    Chia sẻ lên Zalo
                </button>
            )}
        </Link>
    );
}

export default function MyDealsPage() {
    const { user, loading: authLoading, loginWithZalo } = useAuth();
    const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
    const [myDeals, setMyDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        fetch('/api/deals/my')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const parsedData = data.map(d => ({ ...d, deadline: new Date(d.deadline) }));
                    setMyDeals(parsedData);
                }
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (authLoading) return <div className="p-8 text-center text-slate-500">Đang kiểm tra đăng nhập...</div>;

    if (!user) {
        return (
            <>
                <Header title="Deal Của Tôi" />
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4 mt-20">
                    <p className="text-4xl">🔒</p>
                    <p className="font-medium">Vui lòng đăng nhập để xem deal của bạn</p>
                    <button onClick={loginWithZalo} className="btn-cta w-full max-w-[200px]" style={{ background: "#0068FF" }}>Đăng nhập Zalo</button>
                </div>
            </>
        );
    }

    const myActiveDeals = myDeals.filter(d => d.status === "active");
    const myClosedDeals = myDeals.filter(d => d.status !== "active");
    const data = activeTab === "active" ? myActiveDeals : myClosedDeals;

    return (
        <>
            <Header title="Deal Của Tôi" />

            {/* User strip */}
            <div className="px-4 py-3 flex items-center gap-3 bg-white border-b border-slate-100">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-100 flex-shrink-0">
                    <Image src={user.avatar || `https://i.pravatar.cc/150?u=${user.zaloId}`} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>{user.name}</p>
                    <p className="text-xs text-slate-500">{myActiveDeals.length} đang chạy · {myClosedDeals.length} đã đóng</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${activeTab === tab.key ? "border-b-2 text-slate-900" : "text-slate-400"
                            }`}
                        style={{ borderColor: activeTab === tab.key ? "var(--color-primary)" : "transparent", fontFamily: "var(--font-heading)" }}
                    >
                        {tab.label}
                        <span className="ml-1.5 text-xs font-bold" style={{ color: activeTab === tab.key ? "var(--color-primary)" : "#9CA3AF" }}>
                            ({tab.key === "active" ? myActiveDeals.length : myClosedDeals.length})
                        </span>
                    </button>
                ))}
            </div>

            <main className="px-4 py-4 space-y-3 pb-24">
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Đang tải deal...</div>
                ) : data.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                        <p className="text-3xl">📭</p>
                        <p className="font-medium text-slate-500 text-sm">Chưa có deal nào ở mục này</p>
                        <Link href="/create" className="btn-primary inline-flex text-sm py-2 px-6">
                            + Tạo Deal Mới
                        </Link>
                    </div>
                ) : (
                    data.map(deal => <DealListItem key={deal.id} deal={deal} />)
                )}
            </main>
        </>
    );
}
