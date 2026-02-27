// Recommendation engine — analyze spending profiles against card catalog
import type { CreditCard } from "@/types";
import { getAllCards, calculateCardValue } from "@/lib/cards";

export interface SpendingProfile {
    groceries: number;
    dining: number;
    gas: number;
    travel: number;
    streaming: number;
    shopping: number;
    transit: number;
    other: number;
    [key: string]: number;
}

export interface CardRecommendation {
    card: CreditCard;
    annualValue: number;       // net value after annual fee
    annualPointsEarned: number;
    bestCategory: string;
    bestCategoryRate: number;
}

export interface CategoryRecommendation {
    category: string;
    bestCard: CreditCard;
    earnRate: number;
    monthlySpend: number;
    monthlyPointsEarned: number;
}

// Get the best card from a user's wallet for each spending category
export function getBestCardPerCategory(
    walletSlugs: string[],
    spending: SpendingProfile
): CategoryRecommendation[] {
    const allCards = getAllCards();
    const walletCards = allCards.filter((c) => walletSlugs.includes(c.slug));

    if (walletCards.length === 0) return [];

    const categories = Object.entries(spending)
        .filter(([, amount]) => amount > 0)
        .sort(([, a], [, b]) => b - a); // highest spend first

    return categories.map(([category, monthlySpend]) => {
        // Find the card with the highest earn rate for this category
        let bestCard = walletCards[0];
        let bestRate = bestCard.earnRates[category] || bestCard.earnRates.other || 1;

        for (const card of walletCards) {
            const rate = card.earnRates[category] || card.earnRates.other || 1;
            if (rate > bestRate) {
                bestRate = rate;
                bestCard = card;
            }
        }

        return {
            category,
            bestCard,
            earnRate: bestRate,
            monthlySpend,
            monthlyPointsEarned: monthlySpend * bestRate,
        };
    });
}

// Rank ALL cards in the catalog by estimated annual value for a spending profile
export function rankCardsByValue(
    spending: SpendingProfile
): CardRecommendation[] {
    const allCards = getAllCards();

    return allCards
        .map((card) => {
            const annualValue = calculateCardValue(card, spending);

            // Compute annual points earned
            let annualPointsEarned = 0;
            for (const [category, monthlyAmount] of Object.entries(spending)) {
                const earnRate =
                    card.earnRates[category] || card.earnRates.other || 1;
                annualPointsEarned += monthlyAmount * 12 * earnRate;
            }

            // Find best category
            let bestCategory = "other";
            let bestCategoryRate = 1;
            for (const [cat, rate] of Object.entries(card.earnRates)) {
                if (
                    rate > bestCategoryRate &&
                    spending[cat as keyof SpendingProfile] > 0
                ) {
                    bestCategory = cat;
                    bestCategoryRate = rate;
                }
            }

            return {
                card,
                annualValue,
                annualPointsEarned,
                bestCategory,
                bestCategoryRate,
            };
        })
        .sort((a, b) => b.annualValue - a.annualValue);
}

// Get cards the user DOESN'T have, ranked by value
export function getCardsYouDontHave(
    walletSlugs: string[],
    spending: SpendingProfile
): CardRecommendation[] {
    return rankCardsByValue(spending).filter(
        (rec) => !walletSlugs.includes(rec.card.slug)
    );
}

// Calculate total wallet annual value
export function getWalletAnnualValue(
    walletSlugs: string[],
    spending: SpendingProfile
): number {
    const recommendations = getBestCardPerCategory(walletSlugs, spending);
    let totalAnnual = 0;
    for (const rec of recommendations) {
        totalAnnual +=
            rec.monthlyPointsEarned *
            12 *
            (rec.bestCard.pointValue / 100); // cents per point → dollars
    }

    // Subtract annual fees for unique cards used
    const usedSlugs = new Set(recommendations.map((r) => r.bestCard.slug));
    const allCards = getAllCards();
    for (const slug of usedSlugs) {
        const card = allCards.find((c) => c.slug === slug);
        if (card) totalAnnual -= card.annualFee;
    }

    return totalAnnual;
}

// Calculate how much value the user is leaving on the table
export function getMissedValue(
    walletSlugs: string[],
    spending: SpendingProfile
): { bestPossibleValue: number; currentValue: number; missedValue: number; bestNewCard: CardRecommendation | null } {
    const currentValue = getWalletAnnualValue(walletSlugs, spending);
    const cardsNotOwned = getCardsYouDontHave(walletSlugs, spending);
    const bestNewCard = cardsNotOwned.length > 0 ? cardsNotOwned[0] : null;

    // Best possible = if they had every card and used the best one for each category
    const allSlugs = getAllCards().map((c) => c.slug);
    const bestPossibleValue = getWalletAnnualValue(allSlugs, spending);

    return {
        bestPossibleValue,
        currentValue,
        missedValue: bestPossibleValue - currentValue,
        bestNewCard,
    };
}
