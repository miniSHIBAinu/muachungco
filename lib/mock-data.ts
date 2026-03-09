import type { Deal, Product } from "./types";

// Demo deadline helpers
const fromNow = (hours: number) => new Date(Date.now() + hours * 3600_000);
const past = (hours: number) => new Date(Date.now() - hours * 3600_000);

export const MOCK_PRODUCTS: Product[] = [
    { id: "p1", name: "Voucher Trà Sữa The Alley", category: "Ẩm thực", image: "https://picsum.photos/seed/tea/400/300", originalPrice: "200,000đ" },
    { id: "p2", name: "Vé Xem Phim CGV (2 vé)", category: "Giải trí", image: "https://picsum.photos/seed/cinema/400/300", originalPrice: "280,000đ" },
    { id: "p3", name: "Gói Gym 1 Tháng", category: "Sức khỏe", image: "https://picsum.photos/seed/gym/400/300", originalPrice: "500,000đ" },
    { id: "p4", name: "Voucher Pizza 4Ps", category: "Ẩm thực", image: "https://picsum.photos/seed/pizza/400/300", originalPrice: "350,000đ" },
    { id: "p5", name: "Spa & Massage 90 phút", category: "Làm đẹp", image: "https://picsum.photos/seed/spa/400/300", originalPrice: "450,000đ" },
];

const MOCK_PARTICIPANTS_POOL = [
    { id: "u1", name: "Nguyễn Văn A", avatar: "https://ui-avatars.com/api/?name=VA&background=2563EB&color=fff&size=64" },
    { id: "u2", name: "Trần Thị B", avatar: "https://ui-avatars.com/api/?name=TB&background=7C3AED&color=fff&size=64" },
    { id: "u3", name: "Lê Văn C", avatar: "https://ui-avatars.com/api/?name=LC&background=059669&color=fff&size=64" },
    { id: "u4", name: "Phạm Thị D", avatar: "https://ui-avatars.com/api/?name=TD&background=D97706&color=fff&size=64" },
    { id: "u5", name: "Hoàng Văn E", avatar: "https://ui-avatars.com/api/?name=VE&background=DC2626&color=fff&size=64" },
    { id: "u6", name: "Vũ Thị F", avatar: "https://ui-avatars.com/api/?name=TF&background=0891B2&color=fff&size=64" },
    { id: "u7", name: "Đặng Văn G", avatar: "https://ui-avatars.com/api/?name=VG&background=65A30D&color=fff&size=64" },
    { id: "u8", name: "Bùi Thị H", avatar: "https://ui-avatars.com/api/?name=TH&background=9333EA&color=fff&size=64" },
];

const makeParticipants = (count: number) =>
    MOCK_PARTICIPANTS_POOL.slice(0, Math.min(count, MOCK_PARTICIPANTS_POOL.length)).map(p => ({
        ...p,
        joinedAt: new Date(Date.now() - Math.random() * 3600_000)
    }));

export const MOCK_DEALS: Deal[] = [
    {
        id: "d1",
        title: "Hội mê trà sữa chốt đơn gấp! 🧋",
        productName: "Voucher Trà Sữa The Alley",
        productImage: "https://picsum.photos/seed/tea/400/300",
        category: "Ẩm thực",
        milestones: [
            { id: "m1", minParticipants: 5, discountPercent: 10 },
            { id: "m2", minParticipants: 15, discountPercent: 20 },
            { id: "m3", minParticipants: 30, discountPercent: 35 },
        ],
        participants: makeParticipants(12),
        creatorId: "u1",
        creatorName: "Nguyễn Văn A",
        status: "active",
        deadline: fromNow(18),
        createdAt: past(6),
        shareUrl: "https://muachung.co/deals/d1",
    },
    {
        id: "d2",
        title: "Cuối tuần xem phim cùng nhau!",
        productName: "Vé Xem Phim CGV (2 vé)",
        productImage: "https://picsum.photos/seed/cinema/400/300",
        category: "Giải trí",
        milestones: [
            { id: "m1", minParticipants: 10, discountPercent: 15 },
            { id: "m2", minParticipants: 25, discountPercent: 25 },
            { id: "m3", minParticipants: 50, discountPercent: 40 },
        ],
        participants: makeParticipants(8),
        creatorId: "u2",
        creatorName: "Trần Thị B",
        status: "active",
        deadline: fromNow(0.7),
        createdAt: past(23),
        shareUrl: "https://muachung.co/deals/d2",
    },
    {
        id: "d3",
        title: "Gym cùng team! Healthy life 💪",
        productName: "Gói Gym 1 Tháng",
        productImage: "https://picsum.photos/seed/gym/400/300",
        category: "Sức khỏe",
        milestones: [
            { id: "m1", minParticipants: 5, discountPercent: 20 },
            { id: "m2", minParticipants: 10, discountPercent: 30 },
        ],
        participants: makeParticipants(6),
        creatorId: "u3",
        creatorName: "Lê Văn C",
        status: "active",
        deadline: fromNow(5),
        createdAt: past(19),
        shareUrl: "https://muachung.co/deals/d3",
    },
    {
        id: "d4",
        title: "Pizza party Friday night!",
        productName: "Voucher Pizza 4Ps",
        productImage: "https://picsum.photos/seed/pizza/400/300",
        category: "Ẩm thực",
        milestones: [
            { id: "m1", minParticipants: 8, discountPercent: 15 },
            { id: "m2", minParticipants: 20, discountPercent: 25 },
            { id: "m3", minParticipants: 40, discountPercent: 35 },
        ],
        participants: makeParticipants(4),
        creatorId: "u4",
        creatorName: "Phạm Thị D",
        status: "completed",
        deadline: past(2),
        createdAt: past(26),
        shareUrl: "https://muachung.co/deals/d4",
    },
    {
        id: "d5",
        title: "Spa thư giãn cuối tuần",
        productName: "Spa & Massage 90 phút",
        productImage: "https://picsum.photos/seed/spa/400/300",
        category: "Làm đẹp",
        milestones: [
            { id: "m1", minParticipants: 3, discountPercent: 15 },
            { id: "m2", minParticipants: 8, discountPercent: 25 },
        ],
        participants: makeParticipants(2),
        creatorId: "u1",
        creatorName: "Nguyễn Văn A",
        status: "expired",
        deadline: past(5),
        createdAt: past(29),
        shareUrl: "https://muachung.co/deals/d5",
    },
];

// Current logged-in user (mock)
export const CURRENT_USER = {
    id: "u1",
    name: "Nguyễn Văn A",
    avatar: "https://ui-avatars.com/api/?name=VA&background=2563EB&color=fff&size=64",
};
