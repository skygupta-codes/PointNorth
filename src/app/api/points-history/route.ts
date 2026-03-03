import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users, pointsHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/points-history — Fetch points balance change history
export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDb();
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user) {
            return NextResponse.json({ history: [] });
        }

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

        const history = await db
            .select()
            .from(pointsHistory)
            .where(eq(pointsHistory.userId, user.id))
            .orderBy(desc(pointsHistory.recordedAt))
            .limit(limit);

        return NextResponse.json({ history });
    } catch (err) {
        console.error("GET /api/points-history error:", err);
        return NextResponse.json(
            { error: "Failed to fetch points history" },
            { status: 500 }
        );
    }
}
