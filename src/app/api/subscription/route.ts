import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserTier, checkChatLimit, getTierFeatures } from "@/lib/subscription";
import { getDb } from "@/db";
import { userCards } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/subscription — Return user's current plan, usage, and limits
export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tier, userId } = await getUserTier(clerkId);
        const features = getTierFeatures(tier);

        let chatUsage = { used: 0, limit: features.maxChatPerDay };
        let cardCount = 0;

        if (userId) {
            // Get chat usage for today
            const chatCheck = await checkChatLimit(userId, tier);
            chatUsage = { used: chatCheck.used, limit: chatCheck.limit };

            // Get card count
            const db = getDb();
            const cards = await db
                .select({ id: userCards.id })
                .from(userCards)
                .where(eq(userCards.userId, userId));
            cardCount = cards.length;
        }

        return NextResponse.json({
            tier,
            features,
            usage: {
                chat: chatUsage,
                cards: {
                    current: cardCount,
                    limit: features.maxCards,
                },
            },
        });
    } catch (err) {
        console.error("GET /api/subscription error:", err);
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        );
    }
}
