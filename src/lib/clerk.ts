// Clerk auth utilities
// Helpers for working with Clerk in server components and API routes

import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuthUserId(): Promise<string | null> {
    const { userId } = await auth();
    return userId;
}

export async function getAuthUser() {
    const user = await currentUser();
    return user;
}

export async function requireAuth() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }
    return userId;
}
