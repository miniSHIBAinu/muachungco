'use client';

import { useState, useEffect } from "react";
import { formatCountdown } from "@/lib/utils";

interface CountdownRingProps {
    deadline: Date;
    size?: number;
}

export default function CountdownRing({ deadline, size = 200 }: CountdownRingProps) {
    const [time, setTime] = useState(() => formatCountdown(deadline));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(formatCountdown(deadline));
        }, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    const radius = (size - 20) / 2;
    const circumference = Math.PI * 2 * radius;
    // Calculate 24h progress fraction
    const totalSeconds = 24 * 3600;
    const diff = Math.max(0, deadline.getTime() - Date.now());
    const remainingSeconds = Math.floor(diff / 1000);
    const fraction = Math.min(1, remainingSeconds / totalSeconds);
    const dashOffset = circumference * (1 - fraction);

    return (
        <div className="countdown-ring-wrap" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={12}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#FF4444"
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                />
            </svg>
            <div className="countdown-ring-text">
                <span className="countdown-time-big" style={{ fontFamily: "var(--font-heading)" }}>
                    {time.hours}:{time.minutes}:{time.seconds}
                </span>
                <span className="countdown-label-sm">Time Remaining</span>
                {time.isUrgent && (
                    <span className="mt-1 text-xs font-bold rounded-full px-2 py-0.5" style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-heading)" }}>
                        Ends Soon!
                    </span>
                )}
            </div>
        </div>
    );
}
