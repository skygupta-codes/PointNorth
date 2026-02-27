import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/onboarding/complete — mark user's onboarding as done
export async function POST() {
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
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await db
            .update(users)
            .set({ onboardingCompleted: true })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("POST /api/onboarding/complete error:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
