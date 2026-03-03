import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, priceIdToTier, isStripeConfigured } from "@/lib/stripe";
import type Stripe from "stripe";

// POST /api/stripe/webhooks — Handle Stripe subscription lifecycle events
export async function POST(req: Request) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not set");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const body = await req.text();
    const headerPayload = await headers();
    const signature = headerPayload.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const db = getDb();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.mode === "subscription" && session.subscription) {
                    const subscription = await getStripe().subscriptions.retrieve(
                        session.subscription as string
                    );
                    const priceId = subscription.items.data[0]?.price?.id || "";
                    const tier = priceIdToTier(priceId);
                    const customerId = session.customer as string;

                    await db
                        .update(users)
                        .set({
                            subscriptionTier: tier,
                            stripeCustomerId: customerId,
                        })
                        .where(eq(users.stripeCustomerId, customerId));

                    console.log(`✅ Subscription activated: ${customerId} → ${tier}`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const priceId = subscription.items.data[0]?.price?.id || "";

                let tier = priceIdToTier(priceId);

                // Handle cancellation / past_due
                if (
                    subscription.status === "canceled" ||
                    subscription.status === "unpaid"
                ) {
                    tier = "free";
                }

                await db
                    .update(users)
                    .set({ subscriptionTier: tier })
                    .where(eq(users.stripeCustomerId, customerId));

                console.log(`✅ Subscription updated: ${customerId} → ${tier} (${subscription.status})`);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                await db
                    .update(users)
                    .set({ subscriptionTier: "free" })
                    .where(eq(users.stripeCustomerId, customerId));

                console.log(`✅ Subscription canceled: ${customerId} → free`);
                break;
            }

            default:
                // Unhandled event type — ignore silently
                break;
        }
    } catch (err) {
        console.error(`❌ Error handling ${event.type}:`, err);
        return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
