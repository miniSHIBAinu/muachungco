import type { Milestone, Deal } from "./types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCountdown(deadline: Date): { hours: string; minutes: string; seconds: string; isUrgent: boolean } {
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) return { hours: "00", minutes: "00", seconds: "00", isUrgent: true };

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        isUrgent: hours < 1,
    };
}

export function formatTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

export function getCurrentMilestone(participants: number, milestones: Milestone[]): Milestone | null {
    const sorted = [...milestones].sort((a, b) => a.minParticipants - b.minParticipants);
    let current: Milestone | null = null;
    for (const m of sorted) {
        if (participants >= m.minParticipants) current = m;
    }
    return current;
}

export function getNextMilestone(participants: number, milestones: Milestone[]): Milestone | null {
    const sorted = [...milestones].sort((a, b) => a.minParticipants - b.minParticipants);
    return sorted.find(m => m.minParticipants > participants) ?? null;
}

export function getProgressPercent(participants: number, milestones: Milestone[]): number {
    const sorted = [...milestones].sort((a, b) => a.minParticipants - b.minParticipants);
    const maxMilestone = sorted[sorted.length - 1];
    if (!maxMilestone) return 100;
    return Math.min(100, Math.round((participants / maxMilestone.minParticipants) * 100));
}

export function getDealStatusLabel(deal: Deal): { label: string; className: string } {
    switch (deal.status) {
        case "active": return { label: "Đang chạy", className: "badge-blue" };
        case "completed": return { label: "Thành công ✓", className: "badge-green" };
        case "expired": return { label: "Hết hạn", className: "badge-gray" };
        case "closed": return { label: "Đã chốt", className: "badge-orange" };
    }
}

export function formatNumber(n: number): string {
    return n.toLocaleString("vi-VN");
}
