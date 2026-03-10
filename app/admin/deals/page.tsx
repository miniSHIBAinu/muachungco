import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDealsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-slate-800 text-white rounded-lg">
                    <ShoppingBag size={20} />
                </div>
                <h1 className="text-2xl font-bold font-fira-code text-slate-800">Deal Management</h1>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-fira-code text-slate-800">Active Deals</h3>
                    {/* Filter placeholders */}
                    <div className="flex space-x-2">
                        <input type="text" placeholder="Search by title..." className="border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                        <select className="border border-slate-200 rounded-md px-3 py-1.5 text-sm">
                            <option>All Status</option>
                            <option>Open</option>
                            <option>Completed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Target / Joined</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Mock Row */}
                            <tr className="bg-white border-b hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-fira-code">#D-123</td>
                                <td className="px-6 py-4 font-medium text-slate-900">Combo Kem Chống Nắng</td>
                                <td className="px-6 py-4">3</td>
                                <td className="px-6 py-4">10 / 5</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Open</span></td>
                                <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">View</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
