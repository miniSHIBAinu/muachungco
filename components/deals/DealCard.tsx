import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Deal } from "@/lib/types";
import CountdownTimer from "./CountdownTimer";
import { getDealStatusLabel, getCurrentMilestone } from "@/lib/utils";

interface DealCardProps {
    deal: Deal;
    compact?: boolean;
}

/** Small inline countdown (compact) */
function CompactCountdown({ deadline }: { deadline: Date }) {
    return <CountdownTimer deadline={deadline} compact />;
}

export default function DealCard({ deal, compact = false }: DealCardProps) {
    const status = getDealStatusLabel(deal);
    const isActive = deal.status === "active";
    const currentMilestone = getCurrentMilestone(deal.participants.length, deal.milestones);
    const maxPeople = Math.max(...deal.milestones.map(m => m.minParticipants));
    const joinedPercent = Math.min(100, Math.round((deal.participants.length / maxPeople) * 100));
    const topDiscount = Math.max(...deal.milestones.map(m => m.discountPercent));

    return (
        <Link href={`/deals/${deal.id}`} className="block bg-white rounded-[16px] overflow-hidden relative shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(238,77,45,0.12)]">
            {/* Discount Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 bg-[#FF6B35] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
                -{topDiscount}%
            </div>

            {/* Product Image - Portrait Ratio (4:5) */}
            <div className="relative w-full overflow-hidden" style={{ paddingTop: "125%" }}>
                <Image
                    src={deal.productImage}
                    alt={deal.productName}
                    fill
                    className="object-cover absolute inset-0"
                    sizes="(max-width: 480px) 50vw, 240px"
                />
            </div>

            {/* Card Content */}
            <div className="p-3.5 space-y-3 bg-white">
                {/* Title */}
                <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {deal.productName}
                </p>

                {/* Countdown */}
                {isActive && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Clock size={12} className="text-[#EE4D2D]/70" />
                        <span>Ends in {Math.max(0, Math.floor((deal.deadline.getTime() - Date.now()) / 3600000))}h</span>
                    </div>
                )}

                {/* Joined Progress */}
                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                        <span className="text-[#EE4D2D]">{deal.participants.length} Joined</span>
                        <span className="text-slate-400">{maxPeople - deal.participants.length} Left</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#EE4D2D] rounded-full" style={{ width: `${joinedPercent}%` }} />
                    </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                    <div className="w-full py-2 bg-[#FFF0ED] text-[#EE4D2D] text-xs font-bold rounded-lg text-center transition-colors border border-[#EE4D2D]/20 hover:bg-[#EE4D2D] hover:text-white" style={{ fontFamily: "var(--font-heading)" }}>
                        JOIN DEAL
                    </div>
                </div>
            </div>
        </Link>
    );
}
