'use client';

import Image from "next/image";
import { MapPin, Bell, Search } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    showSearch?: boolean;
}

export default function Header({ title, showBack, onBack, showSearch = false }: HeaderProps) {
    const { user, loginWithZalo } = useAuth();

    if (title) {
        return (
            <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                {showBack && (
                    <button onClick={onBack} className="p-1 -ml-1 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors" aria-label="Quay lại">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                )}
                <h1 className="text-base font-bold flex-1 truncate" style={{ fontFamily: "var(--font-heading)" }}>{title}</h1>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-30 bg-white shadow-sm">
            {/* Top Row: Location + Utility Icons */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 cursor-pointer">
                    <MapPin size={16} style={{ color: "var(--color-primary)" }} />
                    <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>
                        Downtown Ho Chi Minh City
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    <button className="relative cursor-pointer text-slate-700 hover:text-slate-900 transition-colors" aria-label="Thông báo">
                        <Bell size={20} />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "var(--color-primary)" }} />
                    </button>
                    <button className="relative cursor-pointer text-slate-700 hover:text-slate-900 transition-colors" aria-label="Giỏ hàng">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        <span className="absolute -top-1.5 -right-2 bg-[#EE4D2D] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">2</span>
                    </button>

                    {user ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer ml-1">
                            <Image src={user.avatar || `https://i.pravatar.cc/150?u=${user.zaloId}`} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <button onClick={loginWithZalo} className="text-[10px] font-bold text-white bg-[#EE4D2D] px-2.5 py-1.5 rounded-md ml-1 whitespace-nowrap" style={{ fontFamily: "var(--font-heading)" }}>
                            ĐĂNG NHẬP
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar Row */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors rounded-full px-4 py-2.5 shadow-inner">
                    <Search size={18} className="text-slate-400 flex-shrink-0" />
                    <input
                        type="text"
                        className="search-input flex-1 text-sm bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
                        placeholder="Search for groceries or home goods..."
                        aria-label="Tìm kiếm"
                        style={{ fontFamily: "var(--font-heading)" }}
                    />
                </div>
            </div>
        </header>
    );
}
