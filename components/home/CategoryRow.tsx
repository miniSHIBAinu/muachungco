'use client';

import Image from "next/image";
import { useState } from "react";

const CATEGORIES = [
    { id: "all", label: "Tất cả", seed: "food" },
    { id: "food", label: "Ẩm thực", seed: "fruit" },
    { id: "grocery", label: "Food & Drink", seed: "grocery" },
    { id: "kitchen", label: "Nhà bếp", seed: "kitchen" },
    { id: "beauty", label: "Làm đẹp", seed: "beauty" },
];

export default function CategoryRow() {
    const [active, setActive] = useState("all");

    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActive(cat.id)}
                    className="category-icon flex-shrink-0"
                >
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-colors ${active === cat.id ? "border-[#EE4D2D]" : "border-transparent"}`}>
                        <Image
                            src={`https://picsum.photos/seed/${cat.seed}/120/120`}
                            alt={cat.label}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <span className={active === cat.id ? "font-bold text-[#EE4D2D]" : "text-slate-700"} style={{ fontSize: "0.75rem" }}>
                        {cat.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
