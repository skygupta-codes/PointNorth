import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users, userLoyaltyAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const VALID_PROGRAMS = [
    "aeroplan",
    "air-miles",
    "westjet",
    "scene",
    "pc-optimum",
    "triangle",
    "marriott",
    "hilton",
    "starbucks",
] as const;

// Helper: get internal user ID
async function getUserId(clerkId: string): Promise<string | null> {
    const db = getDb();
    const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);
    return user?.id || null;
}

// GET /api/loyalty-accounts — Fetch all loyalty accounts for user
export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = await getUserId(clerkId);
        if (!userId) {
            return NextResponse.json({ accounts: [] });
        }

        const db = getDb();
        const accounts = await db
            .select()
            .from(userLoyaltyAccounts)
            .where(eq(userLoyaltyAccounts.userId, userId));

        return NextResponse.json({ accounts });
    } catch (err) {
        console.error("GET /api/loyalty-accounts error:", err);
        return NextResponse.json(
            { error: "Failed to fetch loyalty accounts" },
            { status: 500 }
        );
    }
}

// POST /api/loyalty-accounts — Add a new loyalty account
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = await getUserId(clerkId);
        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await req.json();
        const { program, accountNumber, currentBalance, statusTier, pointsExpiryDate } = body;

        if (!program || !VALID_PROGRAMS.includes(program)) {
            return NextResponse.json(
                { error: `Invalid program. Must be one of: ${VALID_PROGRAMS.join(", ")}` },
                { status: 400 }
            );
        }

        const db = getDb();

        // Check if account already exists for this program
        const [existing] = await db
            .select({ id: userLoyaltyAccounts.id })
            .from(userLoyaltyAccounts)
            .where(
                and(
                    eq(userLoyaltyAccounts.userId, userId),
                    eq(userLoyaltyAccounts.program, program)
                )
            )
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: `You already have a ${program} account. Update it instead.` },
                { status: 409 }
            );
        }

        const [account] = await db
            .insert(userLoyaltyAccounts)
            .values({
                userId,
                program,
                accountNumber: accountNumber || null,
                currentBalance: currentBalance || 0,
                statusTier: statusTier || null,
                pointsExpiryDate: pointsExpiryDate || null,
            })
            .returning();

        return NextResponse.json({ account }, { status: 201 });
    } catch (err) {
        console.error("POST /api/loyalty-accounts error:", err);
        return NextResponse.json(
            { error: "Failed to add loyalty account" },
            { status: 500 }
        );
    }
}

// PATCH /api/loyalty-accounts — Update a loyalty account
export async function PATCH(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = await getUserId(clerkId);
        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await req.json();
        const { id, currentBalance, statusTier, accountNumber, pointsExpiryDate } = body;

        if (!id) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }

        const db = getDb();
        const [updated] = await db
            .update(userLoyaltyAccounts)
            .set({
                ...(currentBalance !== undefined && { currentBalance }),
                ...(statusTier !== undefined && { statusTier }),
                ...(accountNumber !== undefined && { accountNumber }),
                ...(pointsExpiryDate !== undefined && { pointsExpiryDate }),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(userLoyaltyAccounts.id, id),
                    eq(userLoyaltyAccounts.userId, userId)
                )
            )
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        return NextResponse.json({ account: updated });
    } catch (err) {
        console.error("PATCH /api/loyalty-accounts error:", err);
        return NextResponse.json(
            { error: "Failed to update loyalty account" },
            { status: 500 }
        );
    }
}

// DELETE /api/loyalty-accounts — Remove a loyalty account
export async function DELETE(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = await getUserId(clerkId);
        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }

        const db = getDb();
        await db
            .delete(userLoyaltyAccounts)
            .where(
                and(
                    eq(userLoyaltyAccounts.id, id),
                    eq(userLoyaltyAccounts.userId, userId)
                )
            );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE /api/loyalty-accounts error:", err);
        return NextResponse.json(
            { error: "Failed to delete loyalty account" },
            { status: 500 }
        );
    }
}
