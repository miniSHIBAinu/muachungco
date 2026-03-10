import { redirect } from "next/navigation";
import { headers } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { cookies } from "next/headers";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Receipt, LogOut } from "lucide-react";

export const metadata = {
    title: "Admin Dashboard | MuaChungCo",
};

async function getAdminUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("muachung_session")?.value;

    if (!sessionCookie) return null;

    await dbConnect();
    const user = await User.findById(sessionCookie).lean();

    if (!user || user.role !== "admin") return null;
    return user;
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const adminUser = await getAdminUser();

    if (!adminUser) {
        redirect("/"); // Kick out non-admins
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-fira-sans text-slate-800">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex min-h-screen sticky top-0">
                <div className="p-6">
                    <h2 className="text-xl font-bold font-fira-code text-blue-400">MuaChung Admin</h2>
                    <p className="text-xs text-slate-400 mt-1">v1.2.0-secure</p>
                </div>

                <nav className="flex-1 mt-6">
                    <ul className="space-y-2 px-4">
                        <li>
                            <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors">
                                <LayoutDashboard size={18} />
                                <span className="font-medium text-sm">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/deals" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                                <ShoppingBag size={18} />
                                <span className="font-medium text-sm">Active Deals</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/transactions" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                                <Receipt size={18} />
                                <span className="font-medium text-sm">Transactions</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link href="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm">
                        <LogOut size={16} />
                        <span>Back to Store</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden">
                {/* Mobile Header */}
                <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold font-fira-code text-blue-400">MuaChung Admin</h2>
                    <Link href="/" className="text-slate-400">
                        <LogOut size={20} />
                    </Link>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
