'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/layout/Header";
import ProgressMilestone from "@/components/deals/ProgressMilestone";
import { getCurrentMilestone } from "@/lib/utils";
import CountdownRing from "@/components/deals/CountdownRing";
import { Share2, Users, Copy, CheckCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { shareToZalo } from "@/lib/zalo-share";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function DealDetailPage({ params }: PageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const { user, loginWithZalo } = useAuth();

    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showActiveCode, setShowActiveCode] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    // Fetch deal function for reusability (polling)
    const fetchDeal = async () => {
        try {
            const res = await fetch(`/api/deals/${id}`);
            const data = await res.json();
            if (!data.error) {
                data.deadline = new Date(data.deadline);
                setDeal(data);
                return data; // Return updated data
            }
        } catch (e) { console.error(e); }
        return null;
    };

    useEffect(() => {
        fetchDeal().finally(() => setLoading(false));
    }, [id]);

    // Short-Polling logic to detect payment success via Webhook
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showPaymentModal && user && deal) {
            interval = setInterval(async () => {
                const refreshedDeal = await fetchDeal();
                if (refreshedDeal) {
                    const joined = refreshedDeal.participants.some((p: any) => p._id === user._id);
                    if (joined) {
                        setShowPaymentModal(false);
                        clearInterval(interval);
                        // Optional: play success sound or trigger toast
                        alert("Thanh toán thành công! Bạn đã tham gia Deal.");
                    }
                }
            }, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [showPaymentModal, user, deal]);

    if (loading) return <div className="p-8 text-center text-slate-500">Đang tải chi tiết deal...</div>;
    if (!deal) return <div className="p-8 text-center text-red-500 font-bold">Không tìm thấy deal này</div>;

    const isCreator = user ? deal.creatorId?._id === user._id : false;
    const hasJoined = user ? deal.participants.some((p: any) => p._id === user._id) : false;
    const isActive = deal.status === "active";
    const dealt = deal.status === "closed";

    const participantCount = deal.participants.length;
    const currentMilestone = getCurrentMilestone(participantCount, deal.milestones);
    // map minParticipants
    const maxPeople = Math.max(...deal.milestones.map((m: any) => m.minParticipants));
    const joinedPercent = Math.min(100, Math.round((participantCount / maxPeople) * 100));
    const discountCode = deal.finalDiscountCode || "ĐANG TẠO MÃ...";

    const handleJoinClick = () => {
        if (!user) {
            loginWithZalo();
            return;
        }
        if (hasJoined) return;
        // Mở popup thanh toán QR code
        setShowPaymentModal(true);
    };

    const handleCloseDealt = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/deals/${id}/close`, { method: 'POST' });
            const updatedDeal = await res.json();
            if (!updatedDeal.error) {
                updatedDeal.deadline = new Date(updatedDeal.deadline);
                setDeal(updatedDeal);
                setShowConfirmModal(false);
                setShowActiveCode(true);
            }
        } catch (e) { console.error(e); }
        finally { setIsProcessing(false); }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(discountCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            shareToZalo(window.location.href, deal?.productName || 'Mua Chung Deal Hot!');
        }
    };

    if (showActiveCode || (dealt && !isCreator && hasJoined)) {
        return (
            <div className="dark-detail flex flex-col">
                <Header title="Mã Giảm Giá" showBack onBack={() => router.push('/')} />
                <div className="flex-1 px-5 py-6 space-y-6 text-center">
                    <CountdownRing deadline={deal.deadline} />
                    <div className="space-y-2">
                        <p className="text-white/60 text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Active Code</p>
                        <div className="coupon-code">{discountCode}</div>
                        <button onClick={copyCode} className="flex items-center gap-2 mx-auto text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" style={{ fontFamily: "var(--font-heading)" }}>
                            {codeCopied ? <><CheckCircle size={15} /> Đã sao chép!</> : <><Copy size={15} /> Sao chép mã</>}
                        </button>
                    </div>
                    <div className="bg-white/8 rounded-xl p-4 space-y-1">
                        <p className="text-white/60 text-xs" style={{ fontFamily: "var(--font-heading)" }}>Mức giảm giá của bạn</p>
                        <p className="text-4xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                            -{currentMilestone?.discountPercent ?? 0}%
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-white/60 text-xs flex items-center justify-center gap-1.5"><Users size={12} /> {participantCount} người tham gia</p>
                        <div className="space-y-1">
                            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${joinedPercent}%`, background: "var(--color-primary)" }} />
                            </div>
                            <p className="text-white/50 text-xs">{participantCount}/{maxPeople} Joined</p>
                        </div>
                    </div>
                    <button onClick={handleShare} className="btn-zalo mt-4 cursor-pointer"><Share2 size={17} /> Share to Zalo</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header title={deal.productName} showBack onBack={() => router.back()} />

            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <Image src={deal.productImage} alt={deal.productName} fill className="object-cover" sizes="480px" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="discount-badge" style={{ top: 12, left: 12 }}>
                    -{Math.max(...deal.milestones.map((m: any) => m.discountPercent))}%
                </div>
            </div>

            <main className="px-4 py-4 space-y-4 pb-32">
                <div>
                    <h1 className="font-bold text-lg text-slate-900 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>{deal.productName}</h1>
                </div>

                <div className="card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Users size={15} style={{ color: "var(--color-primary)" }} />
                            <span className="font-bold" style={{ fontFamily: "var(--font-heading)" }}>{participantCount}/{maxPeople} Joined</span>
                        </div>
                        {currentMilestone && <span className="badge badge-red text-xs">Giảm {currentMilestone.discountPercent}% 🎉</span>}
                    </div>
                    <div className="joined-bar-track">
                        <div className="joined-bar-fill" style={{ width: `${joinedPercent}%` }} />
                    </div>

                    {/* Convert DB milestones to frontend expected format */}
                    <ProgressMilestone
                        participants={participantCount}
                        milestones={deal.milestones.map((m: any) => ({
                            requiredUsers: m.minParticipants,
                            discountPercent: m.discountPercent
                        }))}
                        showDetails
                    />
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}><Users size={15} /> Người đã tham gia</p>
                    <div className="flex items-center flex-wrap gap-2">
                        {deal.participants.map((p: any) => (
                            <div key={p._id} className="flex items-center gap-1.5 bg-slate-50 rounded-full px-2.5 py-1 border border-slate-200">
                                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--color-primary)" }}>
                                    <Image src={p.avatar || `https://i.pravatar.cc/150?u=${p.zaloId}`} alt={p.name} width={20} height={20} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-medium text-slate-700 truncate max-w-[80px]">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-slate-500">Tạo bởi <strong className="text-slate-700">{deal.creatorId?.name}</strong></p>
            </main>

            {isActive && !dealt && (
                <div className="fixed bottom-[62px] left-0 right-0 max-w-[480px] mx-auto px-4 py-3 bg-white border-t border-slate-100 space-y-2">
                    {isCreator ? (
                        <>
                            <button onClick={() => setShowConfirmModal(true)} className="btn-cta bg-orange-500" disabled={isProcessing}>🔒 CHỐT ĐƠN NGAY</button>
                            {currentMilestone && (
                                <p className="text-center text-xs text-slate-500">
                                    Mức hiện tại: <strong className="text-green-600">Giảm {currentMilestone.discountPercent}%</strong> cho {participantCount} người
                                </p>
                            )}
                        </>
                    ) : hasJoined ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-green-600 font-bold py-1.5" style={{ fontFamily: "var(--font-heading)" }}><CheckCircle size={18} /> Đã tham gia deal</div>
                            <button onClick={handleShare} className="btn-outline w-full justify-center gap-2 cursor-pointer"><Share2 size={15} /> Chia sẻ lên Zalo</button>
                        </div>
                    ) : (
                        <button onClick={handleJoinClick} disabled={isProcessing} className="btn-cta">
                            {isProcessing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" /> Đang xử lý...</> : "🚀 THAM GIA NGAY"}
                        </button>
                    )}
                </div>
            )}

            {dealt && isCreator && !showActiveCode && (
                <div className="fixed bottom-[62px] left-0 right-0 max-w-[480px] mx-auto px-4 py-3 bg-white border-t border-slate-100">
                    <button onClick={() => setShowActiveCode(true)} className="btn-cta bg-green-600">🎉 Xem Mã Giảm Giá Đã Chốt</button>
                </div>
            )}

            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h3 className="font-bold text-lg text-slate-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>Xác nhận chốt đơn?</h3>
                        <p className="text-slate-500 text-sm mb-5">
                            Mức giảm hiện tại: <strong className="text-orange-500">{currentMilestone?.discountPercent ?? 0}%</strong>. Mã sẽ được gửi đến <strong>{participantCount}</strong> người tham gia.
                        </p>
                        <div className="space-y-3">
                            <button onClick={handleCloseDealt} disabled={isProcessing} className="btn-cta bg-orange-500">
                                {isProcessing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />Đang chốt...</> : "✓ Xác nhận chốt đơn"}
                            </button>
                            <button onClick={() => setShowConfirmModal(false)} className="btn-outline w-full justify-center">Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && user && deal && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal-sheet h-[80vh] flex flex-col items-center pt-8 px-6 pb-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h3 className="font-bold text-xl text-slate-800 mb-2 text-center" style={{ fontFamily: "var(--font-heading)" }}>Thanh Toán Cọc</h3>
                        <p className="text-slate-500 text-sm text-center mb-6">Mở ứng dụng ngân hàng và <strong>quét mã VietQR</strong> để cọc. Bạn sẽ được tự động thêm vào Deal sau khi chuyển khoản thành công!</p>

                        <div className="bg-white p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6 mx-auto max-w-[280px]">
                            {/* Dùng URL SePay: truyền Bank code và số tài khoản vào biến môi trường hoặc hardcode cho demo */}
                            {/* Cú pháp Content: MUA <6 cuối DealID> <6 cuối UserID> */}
                            <Image
                                src={`https://qr.sepay.vn/img?bank=MBBank&acc=0912345678&amount=50000&des=MUA%20${deal._id.slice(-6)}%20${user._id.slice(-6)}`}
                                alt="QR Code Thanh Toán"
                                width={260}
                                height={260}
                                className="w-full h-auto rounded-lg rounded-b-none"
                                unoptimized
                            />
                            <div className="bg-blue-50 p-3 rounded-b-lg border-t border-blue-100 text-center space-y-1">
                                <p className="text-xs text-blue-600 font-medium">Nội dung chuyển khoản</p>
                                <p className="text-lg font-bold text-slate-800 tracking-wider font-mono">
                                    MUA {deal._id.slice(-6).toUpperCase()} {user._id.slice(-6).toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div className="text-center space-y-2 mb-6 w-full">
                            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                                <span className="text-slate-500">Nội dung cọc:</span>
                                <span className="font-semibold text-slate-700">{deal.productName}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                                <span className="text-slate-500">Số tiền (VNĐ):</span>
                                <span className="font-bold text-blue-600 text-base">50.000đ</span>
                            </div>
                        </div>

                        <div className="mt-auto w-full pt-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4 animate-pulse">
                                <div className="w-4 h-4 border-2 border-orange-500 border-t-white rounded-full spin" />
                                Đang tự động chờ thanh toán...
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="btn-outline w-full justify-center">Hủy Giao Dịch</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
