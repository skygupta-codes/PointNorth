// Loyalty program definitions — canonical list for UI
export type LoyaltyProgram = {
    slug: string;
    name: string;
    shortName: string;
    currency: string;
    icon: string;
    color: string;
    bgColor: string;
    hasStatusTiers: boolean;
    statusTiers?: string[];
    pointsExpire: boolean;
    expiryNote?: string;
    valueCentsPerPoint: number; // approximate CPP (cents per point)
};

export const LOYALTY_PROGRAMS: LoyaltyProgram[] = [
    {
        slug: "aeroplan",
        name: "Aeroplan",
        shortName: "Aeroplan",
        currency: "Points",
        icon: "✈️",
        color: "text-green-700",
        bgColor: "bg-green-50",
        hasStatusTiers: true,
        statusTiers: ["Member", "25K", "35K", "50K", "75K", "Super Elite"],
        pointsExpire: false,
        expiryNote: "Points don't expire with any earning/redeeming activity",
        valueCentsPerPoint: 1.5,
    },
    {
        slug: "air-miles",
        name: "AIR MILES",
        shortName: "AM",
        currency: "Miles",
        icon: "🎯",
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        hasStatusTiers: true,
        statusTiers: ["Blue", "Gold", "Onyx"],
        pointsExpire: false,
        expiryNote: "Miles no longer expire as of 2023",
        valueCentsPerPoint: 10.5,
    },
    {
        slug: "westjet",
        name: "WestJet Rewards",
        shortName: "WestJet",
        currency: "WestJet Dollars",
        icon: "🍃",
        color: "text-teal-700",
        bgColor: "bg-teal-50",
        hasStatusTiers: true,
        statusTiers: ["Teal", "Silver", "Gold"],
        pointsExpire: true,
        expiryNote: "WestJet dollars expire after 18 months of inactivity",
        valueCentsPerPoint: 100, // $1 = 1 WestJet dollar
    },
    {
        slug: "scene",
        name: "Scene+",
        shortName: "Scene+",
        currency: "Points",
        icon: "🎬",
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        hasStatusTiers: false,
        pointsExpire: true,
        expiryNote: "Points expire after 5 years of inactivity",
        valueCentsPerPoint: 1,
    },
    {
        slug: "pc-optimum",
        name: "PC Optimum",
        shortName: "PC",
        currency: "Points",
        icon: "🔴",
        color: "text-red-700",
        bgColor: "bg-red-50",
        hasStatusTiers: false,
        pointsExpire: true,
        expiryNote: "Points expire after 12 months of inactivity",
        valueCentsPerPoint: 0.1,
    },
    {
        slug: "triangle",
        name: "Triangle Rewards",
        shortName: "Triangle",
        currency: "CT Money",
        icon: "🔺",
        color: "text-red-600",
        bgColor: "bg-red-50",
        hasStatusTiers: false,
        pointsExpire: true,
        expiryNote: "CT Money expires after 18 months of inactivity",
        valueCentsPerPoint: 0.1,
    },
    {
        slug: "marriott",
        name: "Marriott Bonvoy",
        shortName: "Bonvoy",
        currency: "Points",
        icon: "🏨",
        color: "text-amber-800",
        bgColor: "bg-amber-50",
        hasStatusTiers: true,
        statusTiers: ["Member", "Silver Elite", "Gold Elite", "Platinum Elite", "Titanium Elite", "Ambassador"],
        pointsExpire: true,
        expiryNote: "Points expire after 24 months of inactivity",
        valueCentsPerPoint: 0.7,
    },
    {
        slug: "hilton",
        name: "Hilton Honors",
        shortName: "Hilton",
        currency: "Points",
        icon: "🏩",
        color: "text-sky-800",
        bgColor: "bg-sky-50",
        hasStatusTiers: true,
        statusTiers: ["Member", "Silver", "Gold", "Diamond"],
        pointsExpire: true,
        expiryNote: "Points expire after 15 months of inactivity",
        valueCentsPerPoint: 0.5,
    },
    {
        slug: "starbucks",
        name: "Starbucks Rewards",
        shortName: "Starbucks",
        currency: "Stars",
        icon: "☕",
        color: "text-green-800",
        bgColor: "bg-green-50",
        hasStatusTiers: true,
        statusTiers: ["Green", "Gold"],
        pointsExpire: true,
        expiryNote: "Stars expire after 6 months",
        valueCentsPerPoint: 2.2,
    },
];

export function getLoyaltyProgram(slug: string): LoyaltyProgram | undefined {
    return LOYALTY_PROGRAMS.find((p) => p.slug === slug);
}

export function formatPointsValue(points: number, program: LoyaltyProgram): string {
    const valueDollars = (points * program.valueCentsPerPoint) / 100;
    return `~$${valueDollars.toFixed(0)} CAD`;
}
