import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, userCards, spendingProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
    let hasCards = false;
    let hasSpending = false;

    try {
        const user = await currentUser();
        if (!user) redirect("/sign-in");

        if (db) {
            const [dbUser] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.clerkId, user.id))
                .limit(1);

            if (dbUser) {
                const cards = await db
                    .select({ id: userCards.id })
                    .from(userCards)
                    .where(eq(userCards.userId, dbUser.id))
                    .limit(1);
                hasCards = cards.length > 0;

                const [profile] = await db
                    .select({ id: spendingProfiles.id })
                    .from(spendingProfiles)
                    .where(eq(spendingProfiles.userId, dbUser.id))
                    .limit(1);
                hasSpending = !!profile;
            }
        }
    } catch {
        // Continue with defaults
    }

    return <OnboardingClient hasCards={hasCards} hasSpending={hasSpending} />;
}
