import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-slate-800 text-white rounded-lg">
                    <Receipt size={20} />
                </div>
                <h1 className="text-2xl font-bold font-fira-code text-slate-800">Transaction Logs</h1>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-fira-code text-slate-800">SePay Webhook Logs</h3>
                    <input type="text" placeholder="Search Txn ID..." className="border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Txn ID</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Content (Memo)</th>
                                <th className="px-6 py-3">Mapped To Deal</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Mock Row */}
                            <tr className="bg-white border-b hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs">2026-03-10 01:25</td>
                                <td className="px-6 py-4 font-fira-code">FT12345678</td>
                                <td className="px-6 py-4 font-fira-code text-green-600">+125,000</td>
                                <td className="px-6 py-4 font-fira-code">SP1234 UID5678</td>
                                <td className="px-6 py-4">#D-123</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Mapped</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
