'use client';

import { getCurrentMilestone, getNextMilestone, getProgressPercent } from "@/lib/utils";
import type { Milestone } from "@/lib/types";
import { CheckCircle, Users } from "lucide-react";

interface ProgressMilestoneProps {
    participants: number;
    milestones: Milestone[];
    showDetails?: boolean;
}

export default function ProgressMilestone({ participants, milestones, showDetails = false }: ProgressMilestoneProps) {
    const sorted = [...milestones].sort((a, b) => a.minParticipants - b.minParticipants);
    const current = getCurrentMilestone(participants, sorted);
    const next = getNextMilestone(participants, sorted);
    const percent = getProgressPercent(participants, sorted);

    return (
        <div className="space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1.5 text-slate-600">
                    <Users size={14} strokeWidth={2} />
                    <span className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                        {participants} người tham gia
                    </span>
                </div>
                {current && (
                    <span className="badge badge-green text-xs">
                        -{current.discountPercent}% 🎉
                    </span>
                )}
            </div>

            <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>

            {next ? (
                <p className="text-xs text-slate-500" style={{ fontFamily: "var(--font-heading)" }}>
                    <span className="text-blue-600 font-semibold">Cần thêm {next.minParticipants - participants} người</span>
                    {" "}để đạt giảm giá <span className="font-bold text-orange-500">{next.discountPercent}%</span>!
                </p>
            ) : (
                <p className="text-xs text-green-600 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                    ✓ Đã đạt mức giảm giá tối đa!
                </p>
            )}

            {/* Milestone Steps (when showDetails=true) */}
            {showDetails && (
                <div className="mt-3 space-y-2">
                    {sorted.map((m, idx) => {
                        const achieved = participants >= m.minParticipants;
                        const isCurrent = current?.id === m.id && !getNextMilestone(participants, sorted) === false && current?.id === m.id;
                        const isNextTarget = next?.id === m.id;
                        return (
                            <div
                                key={m.id}
                                className={`milestone-item ${achieved ? "achieved" : isNextTarget ? "current" : ""}`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${achieved ? "bg-green-500" : isNextTarget ? "bg-blue-500" : "bg-slate-200"}`}>
                                    {achieved ? (
                                        <CheckCircle size={14} className="text-white" />
                                    ) : (
                                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-heading)", color: achieved ? "#16A34A" : isNextTarget ? "var(--color-primary)" : "var(--color-muted)" }}>
                                        {m.minParticipants} người → Giảm {m.discountPercent}%
                                    </p>
                                </div>
                                <span className={`badge text-xs ${achieved ? "badge-green" : isNextTarget ? "badge-blue" : "badge-gray"}`}>
                                    {achieved ? "Đạt 🎉" : isNextTarget ? "Tiếp theo" : "Chưa đạt"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
