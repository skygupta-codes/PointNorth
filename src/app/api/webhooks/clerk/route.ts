import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Clerk Webhook: Syncs new user signups → Supabase users table
// Full implementation in Day 2 after Supabase setup.

export async function POST(req: Request) {
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // Verify webhook signature (requires svix package — Day 2)
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json(
            { error: "Missing svix headers" },
            { status: 400 }
        );
    }

    const payload = await req.json();
    const eventType = payload.type as string;

    // Handle user creation
    if (eventType === "user.created") {
        // TODO (Day 2): Insert user into Supabase users table
        console.log("User created:", payload.data.id);
    }

    // Handle user update
    if (eventType === "user.updated") {
        // TODO (Day 2): Update user in Supabase users table
        console.log("User updated:", payload.data.id);
    }

    return NextResponse.json({ received: true });
}
