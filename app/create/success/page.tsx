'use client';

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Share2, CheckCircle } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { shareToZalo } from "@/lib/zalo-share";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const product = searchParams.get("product") ?? "Deal của bạn";
    const dealId = searchParams.get("id") ?? "d_new";
    const [dealUrl, setDealUrl] = useState("https://muachung.co/deals/" + dealId);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setDealUrl(`${window.location.origin}/deals/${dealId}`);
        }
    }, [dealId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(dealUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            shareToZalo(dealUrl, product);
        }
    };

    return (
        <>
            <Header title="Deal Đã Tạo!" showBack onBack={() => router.push("/")} />
            <main className="px-4 py-6 space-y-6 text-center">
                {/* Success icon */}
                <div className="space-y-3">
                    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--color-success) 0%, #16A34A 100%)" }}>
                        <CheckCircle size={42} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
                        Deal đã sẵn sàng! 🎉
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Chia sẻ link hoặc mã QR để mời bạn bè tham gia deal<br />
                        <strong className="text-slate-700">&ldquo;{product}&rdquo;</strong>
                    </p>
                </div>

                {/* QR Code */}
                <div className="card p-6 inline-block mx-auto">
                    <QRCodeSVG
                        value={dealUrl}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#1E293B"
                        level="M"
                        includeMargin={false}
                    />
                </div>

                {/* Link */}
                <div className="card p-4 text-left space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Link deal của bạn</p>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600 font-medium flex-1 truncate" style={{ fontFamily: "var(--font-heading)" }}>
                            {dealUrl}
                        </p>
                        <button
                            onClick={handleCopy}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-500" />}
                        </button>
                    </div>
                    <p className={`text-xs text-center transition-opacity ${copied ? "text-green-600 opacity-100" : "opacity-0"}`}>
                        ✓ Đã sao chép link!
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button onClick={handleShare} className="btn-cta cursor-pointer">
                        <Share2 size={18} />
                        Chia sẻ cho bạn bè Zalo
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="btn-outline w-full justify-center"
                    >
                        Về trang chủ
                    </button>
                </div>
            </main>
        </>
    );
}

export default function CreateSuccessPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Đang tải...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
