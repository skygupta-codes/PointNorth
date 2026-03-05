// CPM (cents per mile) engine — core redemption value analysis
// Used by the Travel Planner to evaluate points vs. cash decisions

// ─── Types ─────────────────────────────────────────────

export type ValueTier = "exceptional" | "great" | "good" | "poor" | "terrible";

export interface RedemptionAnalysis {
    milesCost: number;
    cashPriceCad: number;
    estimatedTaxesCad: number;
    centsPerMile: number;
    valueTier: ValueTier;
    tierLabel: string;
    tierColor: string;
    tierEmoji: string;
    recommendation: string;
    breakEvenCashPrice: number;
}

interface TransferableCard {
    name: string;
    balance: number;
    currency: string;
}

interface ShortfallResult {
    shortfall: number;
    canCover: boolean;
    strategy: {
        cardName: string;
        transferAmount: number;
        transferTime: string;
    } | null;
}

// ─── Constants ─────────────────────────────────────────

const TRANSFER_CURRENCIES = ["mr", "td-points", "rbc-avion", "cibc-aventura"] as const;

const TRANSFER_TIMES: Record<string, string> = {
    "mr": "1–3 business days",
    "td-points": "Instant",
    "rbc-avion": "1–2 business days",
    "cibc-aventura": "1–2 business days",
};

const TIER_CONFIG: Record<ValueTier, { label: string; color: string; emoji: string }> = {
    exceptional: { label: "Exceptional", color: "text-green-600", emoji: "🟢" },
    great: { label: "Great", color: "text-lime-600", emoji: "🟡" },
    good: { label: "Good", color: "text-amber-500", emoji: "🟠" },
    poor: { label: "Poor", color: "text-red-500", emoji: "🔴" },
    terrible: { label: "Terrible", color: "text-red-900", emoji: "⛔" },
};

// ─── Redemption Analysis ───────────────────────────────

export function analyzeRedemption(params: {
    milesCost: number;
    cashPriceCad: number;
    estimatedTaxesUsd?: number;
    usdToCadRate?: number;
}): RedemptionAnalysis {
    const {
        milesCost,
        cashPriceCad,
        estimatedTaxesUsd = 0,
        usdToCadRate = 1.36,
    } = params;

    const estimatedTaxesCad = estimatedTaxesUsd * usdToCadRate;
    const netCashValue = cashPriceCad - estimatedTaxesCad;
    const centsPerMile = milesCost > 0 ? (netCashValue / milesCost) * 100 : 0;
    const cpm = Math.round(centsPerMile * 10) / 10; // 1 decimal place

    // Determine tier
    let valueTier: ValueTier;
    if (cpm >= 6.0) valueTier = "exceptional";
    else if (cpm >= 3.0) valueTier = "great";
    else if (cpm >= 2.0) valueTier = "good";
    else if (cpm >= 1.0) valueTier = "poor";
    else valueTier = "terrible";

    const tier = TIER_CONFIG[valueTier];

    // Break-even: cash price at which 2¢/mile baseline is equivalent
    const breakEvenCashPrice = Math.round((milesCost * 0.02) + estimatedTaxesCad);

    // Value multiplier vs baseline 2¢/mile
    const multiplier = Math.round((cpm / 2) * 10) / 10;

    // Recommendation
    let recommendation: string;
    switch (valueTier) {
        case "exceptional":
            recommendation = `Outstanding at ${cpm}¢/mile. Use your miles — you're getting ${multiplier}× the baseline Aeroplan value.`;
            break;
        case "great":
            recommendation = `Solid at ${cpm}¢/mile. Above average Aeroplan redemption. Recommended.`;
            break;
        case "good":
            recommendation = `Decent, but wait for cash to drop below $${breakEvenCashPrice.toLocaleString()} before paying cash.`;
            break;
        case "poor":
        case "terrible":
            recommendation = `Save your miles. A business class sweet spot gives you 3–8× more value.`;
            break;
    }

    return {
        milesCost,
        cashPriceCad,
        estimatedTaxesCad,
        centsPerMile: cpm,
        valueTier,
        tierLabel: tier.label,
        tierColor: tier.color,
        tierEmoji: tier.emoji,
        recommendation,
        breakEvenCashPrice,
    };
}

// ─── Shortfall Calculator ──────────────────────────────

export function calcShortfall(
    milesCost: number,
    aeroplanBalance: number,
    transferableCards: TransferableCard[]
): ShortfallResult {
    const shortfall = Math.max(0, milesCost - aeroplanBalance);

    if (shortfall === 0) {
        return { shortfall: 0, canCover: true, strategy: null };
    }

    // Filter to transferable currencies only
    const eligible = transferableCards.filter((c) =>
        (TRANSFER_CURRENCIES as readonly string[]).includes(c.currency)
    );

    const totalTransferable = eligible.reduce((sum, c) => sum + c.balance, 0);
    const canCover = totalTransferable >= shortfall;

    // Find strategy: smallest balance that still covers the shortfall
    const coveringCards = eligible
        .filter((c) => c.balance >= shortfall)
        .sort((a, b) => a.balance - b.balance);

    let strategy: ShortfallResult["strategy"] = null;

    if (coveringCards.length > 0) {
        const best = coveringCards[0];
        strategy = {
            cardName: best.name,
            transferAmount: shortfall,
            transferTime: TRANSFER_TIMES[best.currency] ?? "Unknown",
        };
    } else if (canCover) {
        // No single card covers it, but combined they do — pick the largest card
        const largest = [...eligible].sort((a, b) => b.balance - a.balance)[0];
        if (largest) {
            strategy = {
                cardName: largest.name,
                transferAmount: largest.balance,
                transferTime: TRANSFER_TIMES[largest.currency] ?? "Unknown",
            };
        }
    }

    return { shortfall, canCover, strategy };
}
