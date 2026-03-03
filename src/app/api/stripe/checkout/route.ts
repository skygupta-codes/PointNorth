import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, STRIPE_PRICES, isStripeConfigured } from "@/lib/stripe";

// POST /api/stripe/checkout — Create a Stripe Checkout session for upgrading
export async function POST(req: Request) {
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

        const body = await req.json();
        const { tier } = body;

        if (!tier || !["plus", "pro"].includes(tier)) {
            return NextResponse.json(
                { error: "Invalid tier. Must be 'plus' or 'pro'" },
                { status: 400 }
            );
        }

        const priceId = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES];
        if (!priceId) {
            return NextResponse.json(
                { error: `Price not configured for tier: ${tier}` },
                { status: 500 }
            );
        }

        // Get or create Stripe customer
        const db = getDb();
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                stripeCustomerId: users.stripeCustomerId,
            })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            // Create a Stripe customer
            const customer = await getStripe().customers.create({
                email: user.email,
                metadata: { clerkId, userId: user.id },
            });
            customerId = customer.id;

            // Save to DB
            await db
                .update(users)
                .set({ stripeCustomerId: customerId })
                .where(eq(users.id, user.id));
        }

        // Create checkout session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://truenorthpoints.ca";

        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${appUrl}/billing?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/upgrade`,
            metadata: { clerkId, tier },
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("POST /api/stripe/checkout error:", err);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
