// Subscription tier checking utilities
import { getDb } from "@/db";
import { users, chatMessages } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { TIER_LIMITS, type SubscriptionTier } from "./stripe";

// Get user's subscription tier from Clerk ID
export async function getUserTier(clerkId: string): Promise<{
    tier: SubscriptionTier;
    userId: string | null;
}> {
    const db = getDb();
    const [user] = await db
        .select({
            id: users.id,
            subscriptionTier: users.subscriptionTier,
        })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

    if (!user) return { tier: "free", userId: null };

    return {
        tier: (user.subscriptionTier as SubscriptionTier) || "free",
        userId: user.id,
    };
}

// Check if user has reached their daily chat limit
export async function checkChatLimit(userId: string, tier: SubscriptionTier): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
}> {
    const limit = TIER_LIMITS[tier].maxChatPerDay;
    if (limit === Infinity) return { allowed: true, used: 0, limit };

    const db = getDb();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayMessages = await db
        .select({ id: chatMessages.id })
        .from(chatMessages)
        .where(
            and(
                eq(chatMessages.userId, userId),
                eq(chatMessages.role, "user"),
                gte(chatMessages.createdAt, todayStart)
            )
        );

    const used = todayMessages.length;
    return { allowed: used < limit, used, limit };
}

// Check if user can add more cards
export async function checkCardLimit(userId: string, tier: SubscriptionTier, currentCount: number): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
}> {
    const limit = TIER_LIMITS[tier].maxCards;
    return {
        allowed: currentCount < limit,
        current: currentCount,
        limit,
    };
}

// Get all feature access for a tier
export function getTierFeatures(tier: SubscriptionTier) {
    return TIER_LIMITS[tier];
}
