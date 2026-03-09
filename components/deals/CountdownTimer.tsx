'use client';

import { useState, useEffect } from "react";
import { formatCountdown } from "@/lib/utils";

interface CountdownTimerProps {
    deadline: Date;
    compact?: boolean;
    banner?: boolean;
}

export default function CountdownTimer({ deadline, compact = false, banner = false }: CountdownTimerProps) {
    const [time, setTime] = useState(() => formatCountdown(deadline));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(formatCountdown(deadline));
        }, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    if (compact) {
        return (
            <span className={`font-bold ${time.isUrgent ? "text-red-500" : "text-slate-600"}`}
                style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem" }}>
                {time.hours}h {time.minutes}m {time.seconds}s
            </span>
        );
    }

    if (banner) {
        return (
            <div className="flex items-center gap-1.5 mt-2">
                {[
                    { value: time.hours, label: "h" },
                    { value: time.minutes, label: "m" },
                    { value: time.seconds, label: "s" },
                ].map(({ value, label }) => (
                    <div key={label} className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-baseline gap-0.5">
                        <span className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
                            {value}
                        </span>
                        <span className="text-white/80 text-[10px] font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    // Default Pill-style
    return (
        <div className="inline-flex items-center gap-2">
            {[
                { value: time.hours, label: "h" },
                { value: time.minutes, label: "m" },
                { value: time.seconds, label: "s" },
            ].map(({ value, label }, i) => (
                <span key={label} className="flex items-center gap-1">
                    <span className={`countdown-pill-digit ${time.isUrgent ? "text-red-300" : ""}`}>
                        {value}{label}
                    </span>
                    {i < 2 && <span className="text-white/50 text-sm font-bold"></span>}
                </span>
            ))}
        </div>
    );
}
