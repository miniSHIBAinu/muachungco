import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { DollarSign, Users, Target } from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchStats() {
    await dbConnect();

    // Real implementation will fetch real stats based on Deals/Transactions
    const totalUsers = await User.countDocuments();
    const rawAdmins = await User.countDocuments({ role: "admin" });

    return {
        totalRevenue: 24500000, // Mock for now, will connect SePay data
        activeDeals: 12,
        totalUsers,
        totalAdmins: rawAdmins
    };
}

export default async function AdminDashboard() {
    const stats = await fetchStats();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Card 1 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold font-fira-code text-slate-800">
                            {stats.totalRevenue.toLocaleString()} ₫
                        </p>
                    </div>
                </div>

                {/* KPI Card 2 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Active Deals</p>
                        <p className="text-2xl font-bold font-fira-code text-slate-800">
                            {stats.activeDeals}
                        </p>
                    </div>
                </div>

                {/* KPI Card 3 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Users</p>
                        <p className="text-2xl font-bold font-fira-code text-slate-800">
                            {stats.totalUsers} ({stats.totalAdmins} Admins)
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder for Charts / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-semibold font-fira-code text-slate-800 mb-4">Revenue Trends</h3>
                    <div className="flex items-center justify-center h-48 bg-slate-50 rounded-lg text-slate-400 text-sm italic">
                        Chart integration pending...
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-semibold font-fira-code text-slate-800 mb-4">Recent Transactions</h3>
                    <div className="flex items-center justify-center h-48 bg-slate-50 rounded-lg text-slate-400 text-sm italic">
                        Table integration pending...
                    </div>
                </div>
            </div>
        </div>
    );
}
