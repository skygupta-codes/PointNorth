// Aeroplan Award Chart — Zone-based miles costs (one-way)
// Source: Aeroplan.com award chart, effective 2024
// All values are ONE-WAY costs in Aeroplan points

export type CabinClass = "economy" | "premiumEconomy" | "business" | "first";

export interface AwardCost {
    economy: number;
    premiumEconomy: number;
    business: number;
    first: number;
}

export interface AwardZonePair {
    id: string;
    name: string;
    description: string;
    fixedMileage: AwardCost;       // Air Canada / fixed-rate partner
    marketFare: { min: AwardCost; max: AwardCost }; // Dynamic pricing range
    partnerAward: AwardCost;       // Star Alliance partner (non-AC)
}

// Aeroplan uses a hybrid model:
// - Fixed Mileage Awards (predictable, available on partner airlines)
// - Market Fare Awards (dynamic pricing on AC metal)
// We show the fixed/partner rates as the primary reference

export const AWARD_CHART: AwardZonePair[] = [
    {
        id: "within-canada-short",
        name: "Within Canada (Short-haul)",
        description: "Flights under 2,200 km within Canada",
        fixedMileage: { economy: 6000, premiumEconomy: 10000, business: 25000, first: 25000 },
        marketFare: {
            min: { economy: 5000, premiumEconomy: 8000, business: 20000, first: 20000 },
            max: { economy: 10000, premiumEconomy: 15000, business: 35000, first: 35000 },
        },
        partnerAward: { economy: 6000, premiumEconomy: 10000, business: 25000, first: 25000 },
    },
    {
        id: "within-canada-long",
        name: "Within Canada (Long-haul)",
        description: "Flights over 2,200 km within Canada (e.g. YYZ→YVR)",
        fixedMileage: { economy: 12500, premiumEconomy: 20000, business: 25000, first: 25000 },
        marketFare: {
            min: { economy: 10000, premiumEconomy: 17000, business: 22000, first: 22000 },
            max: { economy: 20000, premiumEconomy: 30000, business: 45000, first: 45000 },
        },
        partnerAward: { economy: 12500, premiumEconomy: 20000, business: 25000, first: 25000 },
    },
    {
        id: "canada-us-short",
        name: "Canada ↔ US (Short-haul)",
        description: "Cross-border flights under 2,200 km",
        fixedMileage: { economy: 10000, premiumEconomy: 15000, business: 25000, first: 25000 },
        marketFare: {
            min: { economy: 7500, premiumEconomy: 12000, business: 20000, first: 20000 },
            max: { economy: 15000, premiumEconomy: 22000, business: 40000, first: 40000 },
        },
        partnerAward: { economy: 10000, premiumEconomy: 15000, business: 25000, first: 25000 },
    },
    {
        id: "canada-us-long",
        name: "Canada ↔ US (Long-haul)",
        description: "Cross-border flights over 2,200 km (e.g. YYZ→LAX)",
        fixedMileage: { economy: 12500, premiumEconomy: 20000, business: 30000, first: 30000 },
        marketFare: {
            min: { economy: 10000, premiumEconomy: 17000, business: 25000, first: 25000 },
            max: { economy: 22500, premiumEconomy: 32000, business: 50000, first: 50000 },
        },
        partnerAward: { economy: 12500, premiumEconomy: 20000, business: 30000, first: 30000 },
    },
    {
        id: "canada-caribbean",
        name: "Canada ↔ Caribbean / Mexico / Central America",
        description: "Sun destinations and Central American routes",
        fixedMileage: { economy: 15000, premiumEconomy: 23000, business: 35000, first: 50000 },
        marketFare: {
            min: { economy: 12000, premiumEconomy: 20000, business: 30000, first: 45000 },
            max: { economy: 25000, premiumEconomy: 35000, business: 55000, first: 75000 },
        },
        partnerAward: { economy: 15000, premiumEconomy: 23000, business: 35000, first: 50000 },
    },
    {
        id: "canada-europe",
        name: "Canada ↔ Europe",
        description: "Transatlantic flights (e.g. YYZ→LHR, YUL→CDG)",
        fixedMileage: { economy: 30000, premiumEconomy: 40000, business: 60000, first: 90000 },
        marketFare: {
            min: { economy: 25000, premiumEconomy: 35000, business: 50000, first: 80000 },
            max: { economy: 50000, premiumEconomy: 60000, business: 100000, first: 150000 },
        },
        partnerAward: { economy: 30000, premiumEconomy: 40000, business: 60000, first: 90000 },
    },
    {
        id: "canada-asia",
        name: "Canada ↔ Asia / Pacific",
        description: "Transpacific flights (e.g. YVR→NRT, YYZ→HKG)",
        fixedMileage: { economy: 37500, premiumEconomy: 50000, business: 75000, first: 105000 },
        marketFare: {
            min: { economy: 30000, premiumEconomy: 42000, business: 62000, first: 90000 },
            max: { economy: 60000, premiumEconomy: 75000, business: 120000, first: 175000 },
        },
        partnerAward: { economy: 37500, premiumEconomy: 50000, business: 75000, first: 105000 },
    },
    {
        id: "canada-south-america",
        name: "Canada ↔ South America",
        description: "Routes to South America (e.g. YYZ→GRU, YYZ→EZE)",
        fixedMileage: { economy: 25000, premiumEconomy: 35000, business: 55000, first: 80000 },
        marketFare: {
            min: { economy: 20000, premiumEconomy: 30000, business: 45000, first: 70000 },
            max: { economy: 40000, premiumEconomy: 55000, business: 85000, first: 120000 },
        },
        partnerAward: { economy: 25000, premiumEconomy: 35000, business: 55000, first: 80000 },
    },
    {
        id: "canada-middle-east-africa",
        name: "Canada ↔ Middle East / Africa",
        description: "Routes to the Middle East and Africa (e.g. YYZ→IST, YYZ→ADD)",
        fixedMileage: { economy: 40000, premiumEconomy: 55000, business: 70000, first: 100000 },
        marketFare: {
            min: { economy: 32000, premiumEconomy: 45000, business: 58000, first: 85000 },
            max: { economy: 65000, premiumEconomy: 80000, business: 115000, first: 165000 },
        },
        partnerAward: { economy: 40000, premiumEconomy: 55000, business: 70000, first: 100000 },
    },
    {
        id: "canada-oceania",
        name: "Canada ↔ Australia / New Zealand",
        description: "Routes to Oceania (e.g. YVR→SYD, YYZ→AKL)",
        fixedMileage: { economy: 40000, premiumEconomy: 55000, business: 80000, first: 110000 },
        marketFare: {
            min: { economy: 35000, premiumEconomy: 48000, business: 70000, first: 95000 },
            max: { economy: 70000, premiumEconomy: 82000, business: 130000, first: 185000 },
        },
        partnerAward: { economy: 40000, premiumEconomy: 55000, business: 80000, first: 110000 },
    },
];

export const CABIN_LABELS: Record<CabinClass, string> = {
    economy: "Economy",
    premiumEconomy: "Premium Economy",
    business: "Business",
    first: "First",
};

export const CABIN_COLORS: Record<CabinClass, string> = {
    economy: "bg-gray-100 text-gray-700",
    premiumEconomy: "bg-blue-50 text-blue-700",
    business: "bg-amber-50 text-amber-700",
    first: "bg-purple-50 text-purple-700",
};

// Lookup helper
export function getAwardCost(
    zoneId: string,
    cabin: CabinClass,
    type: "fixed" | "partner" = "fixed"
): number | undefined {
    const zone = AWARD_CHART.find((z) => z.id === zoneId);
    if (!zone) return undefined;
    return type === "partner" ? zone.partnerAward[cabin] : zone.fixedMileage[cabin];
}
