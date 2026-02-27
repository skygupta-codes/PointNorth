import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users, userCards } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Helper: get internal user ID from Clerk ID, auto-creating if webhook hasn't fired yet
async function getOrCreateUserId(clerkId: string): Promise<string | null> {
    const db = getDb();
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

    if (existing) return existing.id;

    // User doesn't exist — webhook may not have fired yet. Auto-create.
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) return null;

        const [newUser] = await db
            .insert(users)
            .values({
                clerkId,
                email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
                name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
                onboardingCompleted: false,
            })
            .onConflictDoNothing()
            .returning();

        // If onConflictDoNothing returned nothing, try selecting again (race condition)
        if (!newUser) {
            const [raced] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.clerkId, clerkId))
                .limit(1);
            return raced?.id ?? null;
        }

        return newUser.id;
    } catch (err) {
        console.error("Failed to auto-create user:", err);
        return null;
    }
}

// GET /api/cards — fetch user's wallet
export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = await getOrCreateUserId(clerkId);
        if (!userId) {
            return NextResponse.json({ cards: [] });
        }

        const db = getDb();
        const cards = await db
            .select()
            .from(userCards)
            .where(eq(userCards.userId, userId))
            .orderBy(userCards.addedAt);

        return NextResponse.json({ cards });
    } catch (err) {
        console.error("GET /api/cards error:", err);
        return NextResponse.json(
            { error: "Failed to fetch cards" },
            { status: 500 }
        );
    }
}

// POST /api/cards — add a card to wallet
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = await getOrCreateUserId(clerkId);
        if (!userId) {
            return NextResponse.json(
                { error: "User not found in database. Please sign out and sign in again." },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { cardSlug, nickname, pointsBalance, pointsExpiry, isPrimary } =
            body;

        if (!cardSlug) {
            return NextResponse.json(
                { error: "cardSlug is required" },
                { status: 400 }
            );
        }

        const db = getDb();

        // If marking as primary, unset other primaries first
        if (isPrimary) {
            await db
                .update(userCards)
                .set({ isPrimary: false })
                .where(eq(userCards.userId, userId));
        }

        const [card] = await db
            .insert(userCards)
            .values({
                userId,
                cardSlug,
                nickname: nickname || null,
                pointsBalance: pointsBalance || 0,
                pointsExpiry: pointsExpiry ? new Date(pointsExpiry) : null,
                isPrimary: isPrimary || false,
            })
            .returning();

        return NextResponse.json({ card }, { status: 201 });
    } catch (err) {
        console.error("POST /api/cards error:", err);
        return NextResponse.json(
            { error: "Failed to add card" },
            { status: 500 }
        );
    }
}

// PATCH /api/cards — update a card
export async function PATCH(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = await getOrCreateUserId(clerkId);
        if (!userId) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { id, nickname, pointsBalance, pointsExpiry, isPrimary } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Card id is required" },
                { status: 400 }
            );
        }

        const db = getDb();

        // If marking as primary, unset other primaries first
        if (isPrimary) {
            await db
                .update(userCards)
                .set({ isPrimary: false })
                .where(eq(userCards.userId, userId));
        }

        const updates: Record<string, unknown> = {};
        if (nickname !== undefined) updates.nickname = nickname;
        if (pointsBalance !== undefined) updates.pointsBalance = pointsBalance;
        if (pointsExpiry !== undefined)
            updates.pointsExpiry = pointsExpiry ? new Date(pointsExpiry) : null;
        if (isPrimary !== undefined) updates.isPrimary = isPrimary;

        const [card] = await db
            .update(userCards)
            .set(updates)
            .where(
                and(eq(userCards.id, id), eq(userCards.userId, userId))
            )
            .returning();

        if (!card) {
            return NextResponse.json(
                { error: "Card not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ card });
    } catch (err) {
        console.error("PATCH /api/cards error:", err);
        return NextResponse.json(
            { error: "Failed to update card" },
            { status: 500 }
        );
    }
}

// DELETE /api/cards — remove a card
export async function DELETE(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = await getOrCreateUserId(clerkId);
        if (!userId) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Card id is required" },
                { status: 400 }
            );
        }

        const db = getDb();
        const [deleted] = await db
            .delete(userCards)
            .where(
                and(eq(userCards.id, id), eq(userCards.userId, userId))
            )
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Card not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ deleted: true });
    } catch (err) {
        console.error("DELETE /api/cards error:", err);
        return NextResponse.json(
            { error: "Failed to delete card" },
            { status: 500 }
        );
    }
}
