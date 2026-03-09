'use client';

import type { Deal } from "@/lib/types";
import Link from "next/link";
import CountdownTimer from "@/components/deals/CountdownTimer";

interface FlashBannerProps {
    deal: Deal;
}

export default function FlashBanner({ deal }: FlashBannerProps) {
    const maxDiscount = Math.max(...deal.milestones.map(m => m.discountPercent));

    return (
        <Link href={`/deals/${deal.id}`} className="block relative overflow-hidden rounded-[24px] p-5 shadow-sm" style={{ background: "linear-gradient(135deg, #FCA5A5 0%, #F87171 100%)" }}>
            {/* Organic background shapes matching Figma */}
            <div className="absolute right-0 top-0 bottom-0 w-[65%]" style={{
                background: "#4A9B8F",
                borderTopLeftRadius: "100px",
                borderBottomLeftRadius: "60px",
                transform: "scale(1.2) translateX(10%)",
                opacity: 0.95
            }} />
            <div className="absolute right-12 top-10 w-12 h-12 rounded-full bg-[#F59E0B] opacity-90 blur-[1px]" />
            <div className="absolute -bottom-6 right-20 w-32 h-20 bg-[#4A9B8F] rounded-full blur-[8px]" />

            {/* Title Row */}
            <div className="relative z-10 w-[70%]">
                <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-2.5 py-0.5 mb-2 shadow-sm">
                    <span className="text-[#EE4D2D] text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                        LIMITED TIME
                    </span>
                </div>
                <h2 className="text-white font-extrabold text-[22px] leading-tight mb-1 drop-shadow-md" style={{ fontFamily: "var(--font-heading)" }}>
                    FLASH GROUP DEALS
                </h2>
                <p className="text-white/95 text-[11px] font-medium mb-4 drop-shadow-sm" style={{ fontFamily: "var(--font-heading)" }}>
                    Up to {maxDiscount}% off household essentials
                </p>

                {/* Countdown Pills */}
                <div className="flex items-center gap-1.5">
                    <CountdownTimer deadline={deal.deadline} banner />
                </div>
            </div>
        </Link>
    );
}
