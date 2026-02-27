import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users, userCards, spendingProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
    getBestCardPerCategory,
    getCardsYouDontHave,
    getWalletAnnualValue,
    getMissedValue,
    type SpendingProfile,
} from "@/lib/recommendations";

// GET /api/recommendations — generate recommendations for the user
export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const db = getDb();

        // Get internal user ID
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user) {
            return NextResponse.json({
                hasData: false,
                message: "No user profile found",
            });
        }

        // Fetch spending profile
        const [profile] = await db
            .select()
            .from(spendingProfiles)
            .where(eq(spendingProfiles.userId, user.id))
            .limit(1);

        if (!profile) {
            return NextResponse.json({
                hasData: false,
                message: "Please set up your spending profile first",
            });
        }

        // Fetch wallet
        const cards = await db
            .select()
            .from(userCards)
            .where(eq(userCards.userId, user.id));

        const walletSlugs = cards.map((c) => c.cardSlug);

        const spending: SpendingProfile = {
            groceries: Number(profile.groceries) || 0,
            dining: Number(profile.dining) || 0,
            gas: Number(profile.gas) || 0,
            travel: Number(profile.travel) || 0,
            streaming: Number(profile.streaming) || 0,
            shopping: Number(profile.shopping) || 0,
            transit: Number(profile.transit) || 0,
            other: Number(profile.other) || 0,
        };

        const categoryRecs = getBestCardPerCategory(walletSlugs, spending);
        const cardsToConsider = getCardsYouDontHave(walletSlugs, spending).slice(0, 5);
        const walletValue = getWalletAnnualValue(walletSlugs, spending);
        const missed = getMissedValue(walletSlugs, spending);

        return NextResponse.json({
            hasData: true,
            categoryRecommendations: categoryRecs,
            cardsToConsider,
            walletValue,
            missed,
            walletSize: walletSlugs.length,
        });
    } catch (err) {
        console.error("GET /api/recommendations error:", err);
        return NextResponse.json(
            { error: "Failed to generate recommendations" },
            { status: 500 }
        );
    }
}
