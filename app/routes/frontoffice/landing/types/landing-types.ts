// ─── Landing Page Types ───────────────────────────────────────────────────────

export interface Testimonial {
    id: string;
    author: string;
    location: string;
    avatar: string; // URL placeholder
    rating: number;
    text: string;
    verified: boolean;
}

export interface ComparisonRow {
    criteria: string;
    ours: string | boolean;
    theirs: string | boolean;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface CollectionCard {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    image: string; // URL placeholder
    startingPrice: number;
    currency: string;
    productCount: number;
}

export interface TrustPillar {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface StorySection {
    headline: string;
    subheadline: string;
    body: string;
    image: string; // URL placeholder — SAVA region photo
    imageCaption: string;
}