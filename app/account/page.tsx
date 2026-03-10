import Header from "@/components/layout/Header";
import Image from "next/image";
import { Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const MENU_ITEMS = [
    { icon: Bell, label: "Thông báo", desc: "Quản lý cài đặt thông báo" },
    { icon: Shield, label: "Bảo mật", desc: "Mật khẩu & quyền riêng tư" },
    { icon: HelpCircle, label: "Trợ giúp & Hỗ trợ", desc: "FAQ và liên hệ support" },
    { icon: Settings, label: "Cài đặt", desc: "Ngôn ngữ, theme..." },
];

export default function AccountPage() {
    const { user, loginWithZalo, logout } = useAuth();

    return (
        <>
            <Header title="Tài Khoản" />
            <main className="px-4 py-6 space-y-6">
                {/* Profile card */}
                {user ? (
                    <div className="card p-5 flex flex-col items-center text-center gap-3">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100">
                                <Image src={user.avatar || `https://i.pravatar.cc/150?u=${user.zaloId}`} alt={user.name || "User"} width={80} height={80} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
                                {user.name}
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
                ) : (
                    <div className="card p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                            <Shield size={32} className="text-slate-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>Khách</h2>
                            <p className="text-sm text-slate-500 mt-1">Đăng nhập để quản lý đơn hàng và theo dõi deal.</p>
                        </div>
                        <button
                            onClick={loginWithZalo}
                            className="w-full max-w-[240px] flex items-center justify-center gap-2 bg-[#0068FF] hover:bg-[#0054cc] text-white py-3 px-4 rounded-xl font-bold transition-colors mt-2"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            Đăng nhập bằng Zalo
                        </button>
                    </div>
                )}

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
                {user && (
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors cursor-pointer font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                )}

                <p className="text-center text-xs text-slate-300">Mua Chung Co v0.1.0 · © 2025</p>
            </main>
        </>
    );
}
