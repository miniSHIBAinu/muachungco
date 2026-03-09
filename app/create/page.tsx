'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Image from "next/image";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Plus, Trash2, Clock, Check, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

interface TierRow {
    id: string;
    buyers: string;
    discount: string;
}

const STEPS = ["Chọn sản phẩm", "Cài đặt deal", "Xong!"];

export default function CreateDealPage() {
    const router = useRouter();
    const { user, loginWithZalo } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [dealTitle, setDealTitle] = useState("");
    const [tiers, setTiers] = useState<TierRow[]>([
        { id: "t1", buyers: "5", discount: "10" },
        { id: "t2", buyers: "15", discount: "20" },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addTier = () => {
        if (tiers.length >= 5) return;
        const last = parseInt(tiers[tiers.length - 1]?.buyers || "0");
        setTiers(prev => [...prev, { id: Date.now().toString(), buyers: String(last + 10), discount: "" }]);
    };
    const removeTier = (id: string) => {
        if (tiers.length <= 1) return;
        setTiers(p => p.filter(t => t.id !== id));
    };
    const updateTier = (id: string, field: keyof TierRow, value: string) =>
        setTiers(p => p.map(t => t.id === id ? { ...t, [field]: value } : t));

    const step1Valid = !!selectedProduct;
    const step2Valid = tiers.every(t => t.buyers && t.discount);

    const handleSubmit = async () => {
        if (!step2Valid) return;
        if (!user) {
            loginWithZalo();
            return;
        }

        setIsSubmitting(true);
        try {
            const dealPayload = {
                productName: selectedProduct?.name,
                productImage: selectedProduct?.image,
                title: dealTitle || "Deal mua chung",
                milestones: tiers.map(t => ({
                    minParticipants: parseInt(t.buyers),
                    discountPercent: parseInt(t.discount)
                })),
                deadline: new Date(Date.now() + 24 * 3600000), // Hardcoded 24h as per UI
                status: 'active'
            };

            const res = await fetch('/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dealPayload)
            });
            const newDeal = await res.json();

            if (!newDeal.error) {
                router.push("/create/success?product=" + encodeURIComponent(selectedProduct?.name ?? ""));
            } else {
                alert(newDeal.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header title="Tạo Deal Mới" showBack onBack={() => step === 2 ? setStep(1) : router.back()} />

            {/* Step Indicator */}
            <div className="px-4 py-3 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2">
                    {STEPS.slice(0, 2).map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = step === stepNum;
                        const isDone = step > stepNum;
                        return (
                            <div key={label} className="flex items-center gap-2 flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDone ? "bg-green-500 text-white" : isActive ? "text-white" : "bg-slate-200 text-slate-500"}`}
                                    style={isActive ? { background: "var(--color-primary)" } : {}}>
                                    {isDone ? <Check size={13} /> : stepNum}
                                </div>
                                <span className={`text-xs font-semibold ${isActive ? "text-slate-900" : "text-slate-400"}`}
                                    style={{ fontFamily: "var(--font-heading)" }}>{label}</span>
                                {i < 1 && <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* STEP 1: Select Product */}
            {step === 1 && (
                <main className="px-4 py-5 space-y-4">
                    <div>
                        <h2 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                            Select Product
                        </h2>
                        <p className="text-sm text-slate-500">Chọn sản phẩm cho deal mua chung của bạn</p>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {MOCK_PRODUCTS.map(p => {
                            const isSelected = selectedProduct?.id === p.id;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProduct(isSelected ? null : p)}
                                    className="relative text-left rounded-xl overflow-hidden border-2 transition-all cursor-pointer"
                                    style={{ borderColor: isSelected ? "var(--color-primary)" : "transparent", background: isSelected ? "var(--color-primary-light)" : "white", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ background: "var(--color-primary)" }}>
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                    <div className="relative" style={{ paddingTop: "78%" }}>
                                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="200px" />
                                    </div>
                                    <div className="p-2.5 bg-slate-50">
                                        <p className="text-xs font-bold text-slate-800 line-clamp-2" style={{ fontFamily: "var(--font-heading)" }}>{p.name}</p>
                                        <p className="text-sm font-bold mt-0.5" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>{p.originalPrice}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Next */}
                    <button onClick={() => setStep(2)} disabled={!step1Valid} className="btn-cta">
                        Tiếp theo: Cài đặt deal →
                    </button>
                </main>
            )}

            {/* STEP 2: Configure Deal */}
            {step === 2 && (
                <main className="px-4 py-5 space-y-5 pb-32">
                    <h2 className="font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>Configure Deal</h2>

                    {/* Deal Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700" style={{ fontFamily: "var(--font-heading)" }}>
                            Tên deal <span className="text-slate-400 font-normal">(tùy chọn)</span>
                        </label>
                        <input
                            type="text"
                            value={dealTitle}
                            onChange={e => setDealTitle(e.target.value)}
                            placeholder="Hội mê trà sữa chốt đơn gấp!"
                            className="input"
                            maxLength={60}
                        />
                    </div>

                    {/* Deal Duration */}
                    <div className="tier-row">
                        <div className="flex items-center justify-between mb-3">
                            <p className="font-bold text-slate-900 text-sm" style={{ fontFamily: "var(--font-heading)" }}>Deal Duration</p>
                            <button className="text-xs font-semibold cursor-pointer" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>Edit</button>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={16} style={{ color: "var(--color-secondary)" }} />
                                <div>
                                    <p className="text-xs text-slate-400">Ends in</p>
                                    <p className="font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>24 Hours</p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-center ml-auto">
                                {["23", "59", "59"].map((val, i) => (
                                    <div key={i}>
                                        <p className="font-bold text-xl text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>{val}</p>
                                        <p className="text-xs text-slate-400">{["Hr", "Min", "Sec"][i]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Unlock Discounts – Tiers */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>Unlock Discounts</p>
                            <button onClick={addTier} disabled={tiers.length >= 5} className="flex items-center gap-1 text-sm font-semibold cursor-pointer disabled:opacity-40" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
                                <Plus size={14} /> Add Tier
                            </button>
                        </div>

                        {tiers.map((tier, idx) => (
                            <div key={tier.id} className={`tier-row ${idx === 0 ? "active" : ""}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>Tier {idx + 1}</p>
                                    <div className="flex items-center gap-2">
                                        {idx === 0 && <span className="badge badge-blue text-xs">Base</span>}
                                        {tiers.length > 1 && (
                                            <button onClick={() => removeTier(tier.id)} className="p-1 hover:bg-red-50 rounded cursor-pointer text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Buyers Needed</label>
                                        <input type="number" value={tier.buyers} onChange={e => updateTier(tier.id, "buyers", e.target.value)} className="input text-sm py-2" min={1} placeholder="e.g. 10" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Discount (%)</label>
                                        <input type="number" value={tier.discount} onChange={e => updateTier(tier.id, "discount", e.target.value)} className="input text-sm py-2 font-bold" min={1} max={99} placeholder="e.g. 20" style={{ color: "var(--color-primary)" }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            )}

            {/* Submit Button (step 2) */}
            {step === 2 && (
                <div className="fixed bottom-[62px] left-0 right-0 max-w-[480px] mx-auto px-4 py-3 bg-white/90 backdrop-blur border-t border-slate-100">
                    <button onClick={handleSubmit} disabled={!step2Valid || isSubmitting} className="btn-cta">
                        {isSubmitting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />Đang tạo deal...</>
                        ) : (
                            "✨ Tạo Deal & Lấy Link Chia Sẻ"
                        )}
                    </button>
                </div>
            )}
        </>
    );
}
