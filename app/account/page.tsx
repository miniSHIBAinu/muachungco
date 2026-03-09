import Header from "@/components/layout/Header";
import { CURRENT_USER } from "@/lib/mock-data";
import Image from "next/image";
import { Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";

const MENU_ITEMS = [
    { icon: Bell, label: "Thông báo", desc: "Quản lý cài đặt thông báo" },
    { icon: Shield, label: "Bảo mật", desc: "Mật khẩu & quyền riêng tư" },
    { icon: HelpCircle, label: "Trợ giúp & Hỗ trợ", desc: "FAQ và liên hệ support" },
    { icon: Settings, label: "Cài đặt", desc: "Ngôn ngữ, theme..." },
];

export default function AccountPage() {
    return (
        <>
            <Header title="Tài Khoản" />
            <main className="px-4 py-6 space-y-6">
                {/* Profile card */}
                <div className="card p-5 flex flex-col items-center text-center gap-3">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100">
                            <Image src={CURRENT_USER.avatar} alt={CURRENT_USER.name} width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
                            {CURRENT_USER.name}
                        </h2>
                        <p className="text-sm text-slate-500">Đăng nhập qua Zalo</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full pt-2 border-t border-slate-100">
                        {[
                            { value: "3", label: "Deal đã tạo" },
                            { value: "12", label: "Đã tham gia" },
                            { value: "~28%", label: "Giảm TB" },
                        ].map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <p className="font-bold text-lg text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
                                <p className="text-xs text-slate-500">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Menu */}
                <div className="card overflow-hidden divide-y divide-slate-100">
                    {MENU_ITEMS.map(({ icon: Icon, label, desc }) => (
                        <button key={label} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                                <Icon size={18} style={{ color: "var(--color-primary)" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>{label}</p>
                                <p className="text-xs text-slate-400">{desc}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                        </button>
                    ))}
                </div>

                {/* Logout */}
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors cursor-pointer font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                    <LogOut size={16} />
                    Đăng xuất
                </button>

                <p className="text-center text-xs text-slate-300">Mua Chung Co v0.1.0 · © 2025</p>
            </main>
        </>
    );
}
