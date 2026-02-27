import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Clerk webhook signing secret (set in .env.local after configuring in Clerk dashboard)
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

interface ClerkEmailAddress {
    email_address: string;
    id: string;
}

interface ClerkUserEvent {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
}

export async function POST(req: Request) {
    // --- 1. Verify webhook signature ---
    if (!WEBHOOK_SECRET) {
        console.error("CLERK_WEBHOOK_SECRET is not set");
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 }
        );
    }

    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json(
            { error: "Missing svix headers" },
            { status: 400 }
        );
    }

    const body = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);

    let payload: { type: string; data: ClerkUserEvent };

    try {
        payload = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as { type: string; data: ClerkUserEvent };
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        );
    }

    // --- 2. Handle events ---
    const { type: eventType, data } = payload;
    const db = getDb();

    try {
        if (eventType === "user.created") {
            const primaryEmail = data.email_addresses.find(
                (e) => e.id === data.primary_email_address_id
            );
            const fullName = [data.first_name, data.last_name]
                .filter(Boolean)
                .join(" ");

            await db.insert(users).values({
                clerkId: data.id,
                email: primaryEmail?.email_address ?? "",
                name: fullName || null,
            });

            console.log(`✅ User created: ${data.id} (${primaryEmail?.email_address})`);
        }

        if (eventType === "user.updated") {
            const primaryEmail = data.email_addresses.find(
                (e) => e.id === data.primary_email_address_id
            );
            const fullName = [data.first_name, data.last_name]
                .filter(Boolean)
                .join(" ");

            await db
                .update(users)
                .set({
                    email: primaryEmail?.email_address ?? "",
                    name: fullName || null,
                })
                .where(eq(users.clerkId, data.id));

            console.log(`✅ User updated: ${data.id}`);
        }

        if (eventType === "user.deleted") {
            await db.delete(users).where(eq(users.clerkId, data.id));
            console.log(`✅ User deleted: ${data.id}`);
        }
    } catch (err) {
        console.error(`❌ Error handling ${eventType}:`, err);
        return NextResponse.json(
            { error: "Failed to process webhook" },
            { status: 500 }
        );
    }

    return NextResponse.json({ received: true });
}
