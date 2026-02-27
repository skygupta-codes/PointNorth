import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users, spendingProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper: get internal user ID from Clerk ID
async function getUserId(clerkId: string) {
    const db = getDb();
    const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);
    return user?.id ?? null;
}

// GET /api/spending-profile — fetch user's spending profile
export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = await getUserId(clerkId);
        if (!userId) {
            return NextResponse.json({ profile: null });
        }

        const db = getDb();
        const [profile] = await db
            .select()
            .from(spendingProfiles)
            .where(eq(spendingProfiles.userId, userId))
            .limit(1);

        return NextResponse.json({ profile: profile || null });
    } catch (err) {
        console.error("GET /api/spending-profile error:", err);
        return NextResponse.json(
            { error: "Failed to fetch spending profile" },
            { status: 500 }
        );
    }
}

// POST /api/spending-profile — create or update spending profile
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = await getUserId(clerkId);
        if (!userId) {
            return NextResponse.json(
                { error: "User not found in database" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { groceries, dining, gas, travel, streaming, shopping, transit, other } = body;

        const db = getDb();

        // Check if profile exists
        const [existing] = await db
            .select({ id: spendingProfiles.id })
            .from(spendingProfiles)
            .where(eq(spendingProfiles.userId, userId))
            .limit(1);

        const profileData = {
            groceries: String(groceries || 0),
            dining: String(dining || 0),
            gas: String(gas || 0),
            travel: String(travel || 0),
            streaming: String(streaming || 0),
            shopping: String(shopping || 0),
            transit: String(transit || 0),
            other: String(other || 0),
            updatedAt: new Date(),
        };

        let profile;

        if (existing) {
            [profile] = await db
                .update(spendingProfiles)
                .set(profileData)
                .where(eq(spendingProfiles.id, existing.id))
                .returning();
        } else {
            [profile] = await db
                .insert(spendingProfiles)
                .values({
                    userId,
                    ...profileData,
                })
                .returning();
        }

        return NextResponse.json({ profile });
    } catch (err) {
        console.error("POST /api/spending-profile error:", err);
        return NextResponse.json(
            { error: "Failed to save spending profile" },
            { status: 500 }
        );
    }
}
