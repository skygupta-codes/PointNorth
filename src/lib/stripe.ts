// Stripe client + subscription helpers
import Stripe from "stripe";

// Lazy-initialized Stripe client — avoids crash at build time when key is absent
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-02-25.clover",
        });
    }
    return _stripe;
}

// Subscription tier type
export type SubscriptionTier = "free" | "plus" | "pro";

// Price IDs from Stripe Dashboard — set these in .env.local
export const STRIPE_PRICES = {
    plus: process.env.STRIPE_PRICE_PLUS_MONTHLY || "",
    pro: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
} as const;

// Map Stripe price ID → tier name
export function priceIdToTier(priceId: string): SubscriptionTier {
    if (priceId === STRIPE_PRICES.plus) return "plus";
    if (priceId === STRIPE_PRICES.pro) return "pro";
    return "free";
}

// Tier feature limits
export const TIER_LIMITS = {
    free: {
        maxCards: 3,
        maxChatPerDay: 5,
        hasCardsToConsider: false,
        hasTravelPlanner: false,
        hasExpertConsultations: false,
        hasExpiryAlerts: false,
    },
    plus: {
        maxCards: Infinity,
        maxChatPerDay: Infinity,
        hasCardsToConsider: true,
        hasTravelPlanner: false,
        hasExpertConsultations: false,
        hasExpiryAlerts: true,
    },
    pro: {
        maxCards: Infinity,
        maxChatPerDay: Infinity,
        hasCardsToConsider: true,
        hasTravelPlanner: true,
        hasExpertConsultations: true,
        hasExpiryAlerts: true,
    },
} as const;

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
}
