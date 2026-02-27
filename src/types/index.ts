// TrueNorthPoints — Shared TypeScript types

// Canadian credit card from the JSON catalog
export interface CreditCard {
    slug: string;
    name: string;
    issuer: string;
    network: "visa" | "mastercard" | "amex";
    annualFee: number;
    rewardsCurrency: string;
    transferPartners: string[];
    earnRates: {
        dining: number;
        groceries: number;
        streaming: number;
        transit: number;
        travel: number;
        gas: number;
        other: number;
        [key: string]: number;
    };
    pointValue: number; // CPP (cents per point) baseline
    signUpBonus: {
        points: number;
        spendRequired: number;
        timeframe: string;
    };
    highlights: string[];
    imageUrl: string;
    tier: "budget" | "mid" | "premium" | "ultra-premium";
}

// User's card in their wallet (from DB)
export interface UserCard {
    id: string;
    userId: string;
    cardSlug: string;
    nickname: string | null;
    pointsBalance: number;
    pointsExpiry: Date | null;
    annualFeeDate: Date | null;
    isPrimary: boolean;
    addedAt: Date;
}

// Chat message
export interface ChatMessage {
    id: string;
    userId: string;
    role: "user" | "assistant";
    content: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

// User spending profile
export interface SpendingProfile {
    id: string;
    userId: string;
    groceries: number;
    dining: number;
    gas: number;
    travel: number;
    streaming: number;
    shopping: number;
    transit: number;
    other: number;
    updatedAt: Date;
}

// Canadian provinces
export type Province =
    | "AB"
    | "BC"
    | "MB"
    | "NB"
    | "NL"
    | "NS"
    | "NT"
    | "NU"
    | "ON"
    | "PE"
    | "QC"
    | "SK"
    | "YT";

export const PROVINCE_NAMES: Record<Province, string> = {
    AB: "Alberta",
    BC: "British Columbia",
    MB: "Manitoba",
    NB: "New Brunswick",
    NL: "Newfoundland and Labrador",
    NS: "Nova Scotia",
    NT: "Northwest Territories",
    NU: "Nunavut",
    ON: "Ontario",
    PE: "Prince Edward Island",
    QC: "Quebec",
    SK: "Saskatchewan",
    YT: "Yukon",
};
