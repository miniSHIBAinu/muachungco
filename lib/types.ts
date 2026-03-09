export type DealStatus = 'active' | 'completed' | 'expired' | 'closed';
export type UserRole = 'creator' | 'participant';

export interface Milestone {
    id: string;
    minParticipants: number;
    discountPercent: number;
}

export interface Participant {
    id: string;
    name: string;
    avatar: string;
    joinedAt: Date;
}

export interface Deal {
    id: string;
    title: string;
    productName: string;
    productImage: string;
    category: string;
    milestones: Milestone[];
    participants: Participant[];
    creatorId: string;
    creatorName: string;
    status: DealStatus;
    deadline: Date;
    createdAt: Date;
    shareUrl: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    image: string;
    originalPrice: string;
}
