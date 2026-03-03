import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

// POST /api/stripe/portal — Redirect user to Stripe Customer Portal
export async function POST() {
    try {
        if (!isStripeConfigured()) {
            return NextResponse.json(
                { error: "Stripe is not configured" },
                { status: 503 }
            );
        }

        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDb();
        const [user] = await db
            .select({ stripeCustomerId: users.stripeCustomerId })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: "No billing account found. Please subscribe first." },
                { status: 404 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://truenorthpoints.ca";

        const session = await getStripe().billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${appUrl}/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("POST /api/stripe/portal error:", err);
        return NextResponse.json(
            { error: "Failed to create portal session" },
            { status: 500 }
        );
    }
}
