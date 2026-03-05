// POST /api/travel/flight-search — Master search endpoint
// Combines Duffel cash prices, Aeroplan award chart, CPM analysis, and shortfall strategy

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import {
    users,
    userCards,
    userLoyaltyAccounts,
    awardSearchCache,
} from "@/db/schema";
import { eq, and, sql, gt } from "drizzle-orm";

import { getCashFlightPrices } from "@/lib/travel/duffel";
import { analyzeRedemption, calcShortfall } from "@/lib/travel/calculations";
import { getAwardCost, type CabinClass } from "@/data/aeroplan-award-chart";
import { getAirport, getZonePairId } from "@/data/aeroplan-zones";

import canadianCards from "@/data/canadian-cards.json";

// ─── Helpers ───────────────────────────────────────────

/** Map card slug → transfer currency code (for Aeroplan-transferable cards) */
const SLUG_TO_TRANSFER_CURRENCY: Record<string, string> = {};
const AEROPLAN_TRANSFER_MAP: Record<string, string> = {
    "Membership Rewards": "mr",
    "TD Points": "td-points",
    "RBC Avion": "rbc-avion",
    "CIBC Aventura": "cibc-aventura",
};

for (const card of canadianCards) {
    const transferCurrency = AEROPLAN_TRANSFER_MAP[card.rewardsCurrency];
    if (
        transferCurrency &&
        card.transferPartners?.includes("Aeroplan")
    ) {
        SLUG_TO_TRANSFER_CURRENCY[card.slug] = transferCurrency;
    }
}

/** Map Duffel cabin param to Aeroplan CabinClass key */
const CABIN_MAP: Record<string, CabinClass> = {
    economy: "economy",
    premium_economy: "premiumEconomy",
    business: "business",
    first: "first",
};

// ─── Route Handler ─────────────────────────────────────

export async function POST(req: Request) {
    try {
        // 1. AUTHENTICATE
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const db = getDb();

        // 2. SUBSCRIPTION GATE
        const [user] = await db
            .select({
                id: users.id,
                subscriptionTier: users.subscriptionTier,
            })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.subscriptionTier !== "pro") {
            return NextResponse.json(
                { error: "Pro subscription required", upgrade: true },
                { status: 403 }
            );
        }

        // 3. PARSE BODY
        const body = await req.json();
        const { origin, destination, departureDate, cabin } = body;

        if (!origin || !destination || !departureDate || !cabin) {
            return NextResponse.json(
                { error: "Missing required fields: origin, destination, departureDate, cabin" },
                { status: 400 }
            );
        }

        // 4. CACHE CHECK
        const cacheKey = `${origin}-${destination}-${departureDate}-${cabin}`;

        const [cached] = await db
            .select({ resultJson: awardSearchCache.resultJson })
            .from(awardSearchCache)
            .where(
                and(
                    eq(awardSearchCache.cacheKey, cacheKey),
                    gt(awardSearchCache.expiresAt, sql`NOW()`)
                )
            )
            .limit(1);

        if (cached) {
            return NextResponse.json(cached.resultJson);
        }

        // 5. USER PORTFOLIO

        // Aeroplan balance
        const [loyaltyAccount] = await db
            .select({ currentBalance: userLoyaltyAccounts.currentBalance })
            .from(userLoyaltyAccounts)
            .where(
                and(
                    eq(userLoyaltyAccounts.userId, user.id),
                    eq(userLoyaltyAccounts.program, "aeroplan")
                )
            )
            .limit(1);

        const aeroplanBalance = loyaltyAccount?.currentBalance ?? 0;

        // User's cards with point balances
        const walletCards = await db
            .select({
                cardSlug: userCards.cardSlug,
                pointsBalance: userCards.pointsBalance,
                nickname: userCards.nickname,
            })
            .from(userCards)
            .where(eq(userCards.userId, user.id));

        // Filter to Aeroplan-transferable cards
        const transferableCards = walletCards
            .filter((c) => SLUG_TO_TRANSFER_CURRENCY[c.cardSlug])
            .map((c) => {
                const cardMeta = canadianCards.find(
                    (cc: { slug: string }) => cc.slug === c.cardSlug
                );
                return {
                    name: c.nickname || cardMeta?.name || c.cardSlug,
                    balance: c.pointsBalance ?? 0,
                    currency: SLUG_TO_TRANSFER_CURRENCY[c.cardSlug],
                };
            });

        // 6. PARALLEL FETCH: Duffel cash prices + Aeroplan award chart

        // Map airport zones → award chart zone ID
        const originAirport = getAirport(origin);
        const destAirport = getAirport(destination);
        const originZone = originAirport?.zone ?? "canada";
        const destZone = destAirport?.zone ?? "europe";
        const zonePairId = getZonePairId(originZone, destZone);

        const aeroplanCabin = CABIN_MAP[cabin] ?? "economy";

        const [cashResult, _milesResult] = await Promise.allSettled([
            getCashFlightPrices({
                origin,
                destination,
                departureDate,
                cabin: cabin as "economy" | "premium_economy" | "business" | "first",
            }),
            // Award chart is static — no async needed, but keeping for symmetry
            Promise.resolve(
                zonePairId ? getAwardCost(zonePairId, aeroplanCabin) : undefined
            ),
        ]);

        const cashOptions =
            cashResult.status === "fulfilled" ? cashResult.value.slice(0, 3) : [];
        const milesCost =
            _milesResult.status === "fulfilled" ? _milesResult.value ?? null : null;

        // 7. CALCULATE
        const cheapestCash = cashOptions[0]?.totalCad ?? null;

        const analysis =
            milesCost && cheapestCash
                ? analyzeRedemption({
                    milesCost,
                    cashPriceCad: cheapestCash,
                })
                : null;

        const shortfall = milesCost
            ? calcShortfall(milesCost, aeroplanBalance, transferableCards)
            : null;

        // 8. BUILD RESULT
        const result = {
            origin,
            destination,
            departureDate,
            cabin,
            milesCost,
            cashOptions,
            analysis,
            userAeroplanBalance: aeroplanBalance,
            shortfall,
            transferableCards,
            liveAvailability: null,
            availabilityNote:
                "Live seat availability coming in the next update.",
        };

        // 9. CACHE WRITE (upsert with 4-hour expiry)
        await db
            .insert(awardSearchCache)
            .values({
                cacheKey,
                resultJson: result,
                expiresAt: sql`NOW() + INTERVAL '4 hours'`,
            })
            .onConflictDoUpdate({
                target: awardSearchCache.cacheKey,
                set: {
                    resultJson: result,
                    cachedAt: sql`NOW()`,
                    expiresAt: sql`NOW() + INTERVAL '4 hours'`,
                },
            });

        // 10. RETURN
        return NextResponse.json(result);
    } catch (error) {
        console.error("POST /api/travel/flight-search error:", error);
        return NextResponse.json(
            { error: "Flight search failed" },
            { status: 500 }
        );
    }
}
