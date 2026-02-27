// Card catalog utilities — load, search, and filter credit cards
import type { CreditCard } from "@/types";
import cardsData from "@/data/canadian-cards.json";

// Load the full catalog
export function getAllCards(): CreditCard[] {
    return cardsData as CreditCard[];
}

// Find a single card by slug
export function getCardBySlug(slug: string): CreditCard | undefined {
    return getAllCards().find((card) => card.slug === slug);
}

// Search cards by name, issuer, or reward currency
export function searchCards(query: string): CreditCard[] {
    const q = query.toLowerCase().trim();
    if (!q) return getAllCards();

    return getAllCards().filter(
        (card) =>
            card.name.toLowerCase().includes(q) ||
            card.issuer.toLowerCase().includes(q) ||
            card.rewardsCurrency.toLowerCase().includes(q) ||
            card.network.toLowerCase().includes(q) ||
            card.highlights.some((h) => h.toLowerCase().includes(q))
    );
}

// Filter cards by criteria
export function filterCards(filters: {
    network?: CreditCard["network"];
    tier?: CreditCard["tier"];
    maxAnnualFee?: number;
    rewardsCurrency?: string;
    hasSignUpBonus?: boolean;
}): CreditCard[] {
    let cards = getAllCards();

    if (filters.network) {
        cards = cards.filter((c) => c.network === filters.network);
    }
    if (filters.tier) {
        cards = cards.filter((c) => c.tier === filters.tier);
    }
    if (filters.maxAnnualFee !== undefined) {
        cards = cards.filter((c) => c.annualFee <= filters.maxAnnualFee!);
    }
    if (filters.rewardsCurrency) {
        cards = cards.filter(
            (c) =>
                c.rewardsCurrency.toLowerCase() ===
                filters.rewardsCurrency!.toLowerCase()
        );
    }
    if (filters.hasSignUpBonus) {
        cards = cards.filter((c) => c.signUpBonus.points > 0);
    }

    return cards;
}

// Get the best card for a specific spending category
export function getBestCardForCategory(
    category: keyof CreditCard["earnRates"]
): CreditCard[] {
    return getAllCards()
        .filter((c) => c.earnRates[category] > 1)
        .sort(
            (a, b) =>
                (b.earnRates[category] || 0) - (a.earnRates[category] || 0)
        );
}

// Get all unique issuers
export function getIssuers(): string[] {
    const issuers = new Set(getAllCards().map((c) => c.issuer));
    return Array.from(issuers).sort();
}

// Get all unique reward currencies
export function getRewardCurrencies(): string[] {
    const currencies = new Set(getAllCards().map((c) => c.rewardsCurrency));
    return Array.from(currencies).sort();
}

// Calculate estimated annual value for a spending profile
export function calculateCardValue(
    card: CreditCard,
    monthlySpending: Record<string, number>
): number {
    let totalAnnualPoints = 0;
    for (const [category, monthlyAmount] of Object.entries(monthlySpending)) {
        const earnRate = card.earnRates[category] || card.earnRates.other || 1;
        totalAnnualPoints += monthlyAmount * 12 * earnRate;
    }
    const annualValue = totalAnnualPoints * (card.pointValue / 100); // cents per point → dollars
    return annualValue - card.annualFee;
}
