'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tag, Plus, User } from "lucide-react";

const NAV_ITEMS = [
    { href: "/", icon: Home, label: "Trang Chủ" },
    { href: "/my-deals", icon: Tag, label: "Deal" },
    { href: "/account", icon: User, label: "Tài Khoản" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            {/* Home */}
            {NAV_ITEMS.slice(0, 2).map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                    <Link key={href} href={href} className={`nav-item ${isActive ? "active" : ""}`}>
                        <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span>{label}</span>
                    </Link>
                );
            })}

            {/* Center Create FAB */}
            <Link href="/create" className="nav-fab" aria-label="Tạo Deal">
                <Plus size={24} strokeWidth={2.5} />
            </Link>

            {/* Account */}
            {NAV_ITEMS.slice(2).map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                    <Link key={href} href={href} className={`nav-item ${isActive ? "active" : ""}`}>
                        <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
