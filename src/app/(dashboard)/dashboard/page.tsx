import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    CreditCard,
    TrendingUp,
    MessageCircle,
    Bell,
    Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { users, userCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCardBySlug } from "@/lib/cards";

export const dynamic = "force-dynamic";

// Fetch user's wallet data from the database
async function getUserWallet(clerkId: string) {
    if (!db) return { cards: [], totalPoints: 0, expiringSoon: 0 };

    try {
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user) return { cards: [], totalPoints: 0, expiringSoon: 0 };

        const cards = await db
            .select()
            .from(userCards)
            .where(eq(userCards.userId, user.id))
            .orderBy(userCards.addedAt);

        const totalPoints = cards.reduce(
            (sum, c) => sum + (c.pointsBalance ?? 0),
            0
        );

        const now = new Date();
        const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const expiringSoon = cards.filter(
            (c) => c.pointsExpiry && c.pointsExpiry <= in90Days
        ).length;

        return { cards, totalPoints, expiringSoon };
    } catch (err) {
        console.error("Failed to fetch wallet:", err);
        return { cards: [], totalPoints: 0, expiringSoon: 0 };
    }
}

export default async function DashboardPage() {
    let firstName = "there";
    let walletData = { cards: [] as typeof walletCards, totalPoints: 0, expiringSoon: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let walletCards: any[] = [];

    try {
        const user = await currentUser();
        if (!user) redirect("/sign-in");
        firstName = user.firstName || "there";
        walletData = await getUserWallet(user.id);
        walletCards = walletData.cards;
    } catch {
        // Clerk not configured yet
    }

    const enrichedCards = walletCards.map((uc) => ({
        ...uc,
        details: getCardBySlug(uc.cardSlug),
    }));

    const primaryCard = enrichedCards.find((c) => c.isPrimary);

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Welcome back, {firstName}! 👋
                </h1>
                <p className="mt-2 text-zinc-400">
                    Here&apos;s your rewards overview for today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Total Points
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {walletData.totalPoints.toLocaleString()}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                            {walletCards.length > 0
                                ? `Across ${walletCards.length} card${walletCards.length !== 1 ? "s" : ""}`
                                : "Add cards to track your points"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Cards in Wallet
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {walletCards.length}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                            {walletCards.length > 0
                                ? `Primary: ${primaryCard?.details?.name || "None set"}`
                                : "No cards added yet"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Expiring Soon
                        </CardTitle>
                        <Bell className={`h-4 w-4 ${walletData.expiringSoon > 0 ? "text-rose-400" : "text-zinc-600"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${walletData.expiringSoon > 0 ? "text-rose-400" : "text-white"}`}>
                            {walletData.expiringSoon}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                            {walletData.expiringSoon > 0
                                ? "Points expiring within 90 days!"
                                : "No upcoming expirations"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/wallet">
                        <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-amber-500/50 hover:bg-zinc-900">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                                    <Plus className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {walletCards.length === 0 ? "Add Your First Card" : "Manage Wallet"}
                                    </h3>
                                    <p className="text-sm text-zinc-400">
                                        {walletCards.length === 0
                                            ? "Start tracking rewards by adding a credit card"
                                            : `${walletCards.length} cards · ${walletData.totalPoints.toLocaleString()} points`}
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="ml-auto bg-amber-500/10 text-amber-400"
                                >
                                    {walletCards.length === 0 ? "Get Started" : "View"}
                                </Badge>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/chat">
                        <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-emerald-500/50 hover:bg-zinc-900">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <MessageCircle className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Chat with Maple 🍁</h3>
                                    <p className="text-sm text-zinc-400">
                                        Ask our AI advisor about your rewards
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="ml-auto bg-emerald-500/10 text-emerald-400"
                                >
                                    Try Now
                                </Badge>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Recent Cards or Empty State */}
            {walletCards.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                            <CreditCard className="h-8 w-8 text-zinc-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">
                            Your wallet is empty
                        </h3>
                        <p className="mb-6 max-w-sm text-center text-sm text-zinc-400">
                            Add your Canadian credit cards to start tracking points, get
                            spending recommendations, and never miss a rewards opportunity.
                        </p>
                        <Link href="/wallet">
                            <Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                                <Plus className="mr-2 h-4 w-4" />
                                Add a Card
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <h2 className="mb-4 text-lg font-semibold">Your Cards</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {enrichedCards.slice(0, 6).map((card) => (
                            <Link key={card.id} href="/wallet">
                                <Card className="border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-amber-400" />
                                                <span className="text-sm font-medium text-white truncate">
                                                    {card.nickname || card.details?.name || card.cardSlug}
                                                </span>
                                            </div>
                                            {card.isPrimary && (
                                                <Badge className="bg-amber-500/20 text-xs text-amber-400">
                                                    Primary
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-baseline justify-between">
                                            <span className="text-2xl font-bold text-white">
                                                {(card.pointsBalance ?? 0).toLocaleString()}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                {card.details?.rewardsCurrency || "points"}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
