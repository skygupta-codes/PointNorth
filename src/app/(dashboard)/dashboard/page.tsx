import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    CreditCard,
    TrendingUp,
    MessageCircle,
    Bell,
    Plus,
    Sparkles,
    AlertTriangle,
    DollarSign,
    ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { users, userCards, spendingProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCardBySlug } from "@/lib/cards";
import {
    getBestCardPerCategory,
    getMissedValue,
    type SpendingProfile,
} from "@/lib/recommendations";

export const dynamic = "force-dynamic";

async function getDashboardData(clerkId: string) {
    if (!db) return null;

    try {
        const [user] = await db
            .select({ id: users.id, onboardingCompleted: users.onboardingCompleted })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user) return { needsOnboarding: true };

        const cards = await db
            .select()
            .from(userCards)
            .where(eq(userCards.userId, user.id))
            .orderBy(userCards.addedAt);

        const [profile] = await db
            .select()
            .from(spendingProfiles)
            .where(eq(spendingProfiles.userId, user.id))
            .limit(1);

        const totalPoints = cards.reduce(
            (sum, c) => sum + (c.pointsBalance ?? 0),
            0
        );

        const now = new Date();
        const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const expiringSoon = cards.filter(
            (c) => c.pointsExpiry && c.pointsExpiry <= in90Days
        ).length;

        const spending: SpendingProfile | null = profile
            ? {
                groceries: Number(profile.groceries) || 0,
                dining: Number(profile.dining) || 0,
                gas: Number(profile.gas) || 0,
                travel: Number(profile.travel) || 0,
                streaming: Number(profile.streaming) || 0,
                shopping: Number(profile.shopping) || 0,
                transit: Number(profile.transit) || 0,
                other: Number(profile.other) || 0,
            }
            : null;

        const walletSlugs = cards.map((c) => c.cardSlug);

        let topPicks: ReturnType<typeof getBestCardPerCategory> = [];
        let missed = null;
        if (spending && walletSlugs.length > 0) {
            topPicks = getBestCardPerCategory(walletSlugs, spending).slice(0, 3);
            missed = getMissedValue(walletSlugs, spending);
        }

        return {
            needsOnboarding: !user.onboardingCompleted,
            cards,
            totalPoints,
            expiringSoon,
            hasSpendingProfile: !!profile,
            topPicks,
            missed,
        };
    } catch (err) {
        console.error("Dashboard data error:", err);
        return null;
    }
}

const categoryEmojis: Record<string, string> = {
    groceries: "🛒", dining: "🍽️", gas: "⛽", travel: "✈️",
    streaming: "📺", shopping: "🛍️", transit: "🚇", other: "💳",
};
const categoryLabels: Record<string, string> = {
    groceries: "Groceries", dining: "Dining", gas: "Gas", travel: "Travel",
    streaming: "Streaming", shopping: "Shopping", transit: "Transit", other: "Other",
};

export default async function DashboardPage() {
    let firstName = "there";
    let data: Awaited<ReturnType<typeof getDashboardData>> = null;

    try {
        const user = await currentUser();
        if (!user) redirect("/sign-in");
        firstName = user.firstName || "there";
        data = await getDashboardData(user.id);
        if (data?.needsOnboarding) redirect("/onboarding");
    } catch {
        // Clerk not configured
    }

    const walletCards = data?.cards || [];
    const enrichedCards = walletCards.map((uc) => ({
        ...uc,
        details: getCardBySlug(uc.cardSlug),
    }));
    const primaryCard = enrichedCards.find((c) => c.isPrimary);

    return (
        <>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {firstName}! 👋
                </h1>
                <p className="mt-2 text-gray-500">
                    Here&apos;s your rewards overview for today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Points</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            {(data?.totalPoints || 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            {walletCards.length > 0
                                ? `Across ${walletCards.length} card${walletCards.length !== 1 ? "s" : ""}`
                                : "Add cards to track your points"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Cards in Wallet</CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{walletCards.length}</div>
                        <p className="mt-1 text-xs text-gray-400">
                            {walletCards.length > 0
                                ? `Primary: ${primaryCard?.details?.name || "None set"}`
                                : "No cards added yet"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Expiring Soon</CardTitle>
                        <Bell className={`h-4 w-4 ${(data?.expiringSoon || 0) > 0 ? "text-rose-500" : "text-gray-300"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${(data?.expiringSoon || 0) > 0 ? "text-rose-500" : "text-gray-900"}`}>
                            {data?.expiringSoon || 0}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            {(data?.expiringSoon || 0) > 0 ? "Points expiring within 90 days!" : "No upcoming expirations"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations Widget */}
            {data?.topPicks && data.topPicks.length > 0 && data.missed && (
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Smart Picks
                        </h2>
                        <Link href="/recommendations">
                            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                                View All <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-gray-200 bg-white shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-gray-500">Use These Cards</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.topPicks.map((rec) => (
                                    <div key={rec.category} className="flex items-center gap-3">
                                        <span className="text-lg">{categoryEmojis[rec.category] || "💳"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 truncate">{rec.bestCard.name}</p>
                                            <p className="text-xs text-gray-400">{categoryLabels[rec.category]}</p>
                                        </div>
                                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                                            {rec.earnRate}x
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className={`border-gray-200 bg-white shadow-sm ${data.missed.missedValue > 50 ? "border-amber-300" : ""}`}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
                                    <AlertTriangle className={`h-4 w-4 ${data.missed.missedValue > 50 ? "text-amber-500" : "text-gray-300"}`} />
                                    Wallet Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Your annual value</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        ${Math.round(data.missed.currentValue).toLocaleString()}
                                    </span>
                                </div>
                                {data.missed.missedValue > 10 && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Opportunity gap</span>
                                            <span className="text-lg font-bold text-amber-600">
                                                +${Math.round(data.missed.missedValue).toLocaleString()}
                                            </span>
                                        </div>
                                        {data.missed.bestNewCard && (
                                            <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                                                <p className="text-xs text-gray-500">Consider getting:</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {data.missed.bestNewCard.card.name}
                                                </p>
                                                <p className="text-xs text-emerald-600">
                                                    +${Math.round(data.missed.bestNewCard.annualValue)}/yr net value
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Setup prompt */}
            {walletCards.length > 0 && !data?.hasSpendingProfile && (
                <Link href="/spending">
                    <Card className="mb-8 cursor-pointer border-amber-200 bg-amber-50 transition-all hover:bg-amber-100">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                                <DollarSign className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Set up your spending profile</h3>
                                <p className="text-sm text-gray-500">
                                    Tell us your monthly spending to get personalized card recommendations
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-amber-600" />
                        </CardContent>
                    </Card>
                </Link>
            )}

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/wallet">
                        <Card className="group cursor-pointer border-gray-200 bg-white shadow-sm transition-all hover:border-amber-300 hover:shadow-md">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                    <Plus className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {walletCards.length === 0 ? "Add Your First Card" : "Manage Wallet"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {walletCards.length === 0
                                            ? "Start tracking rewards by adding a credit card"
                                            : `${walletCards.length} cards · ${(data?.totalPoints || 0).toLocaleString()} points`}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="ml-auto bg-amber-50 text-amber-700">
                                    {walletCards.length === 0 ? "Get Started" : "View"}
                                </Badge>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/chat">
                        <Card className="group cursor-pointer border-gray-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                    <MessageCircle className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Chat with Maple 🍁</h3>
                                    <p className="text-sm text-gray-500">Ask our AI advisor about your rewards</p>
                                </div>
                                <Badge variant="secondary" className="ml-auto bg-emerald-50 text-emerald-700">
                                    Try Now
                                </Badge>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Your Cards */}
            {walletCards.length === 0 ? (
                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Your wallet is empty</h3>
                        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
                            Add your Canadian credit cards to start tracking points and get smart recommendations.
                        </p>
                        <Link href="/wallet">
                            <Button className="bg-amber-500 text-white hover:bg-amber-600">
                                <Plus className="mr-2 h-4 w-4" />
                                Add a Card
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Cards</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {enrichedCards.slice(0, 6).map((card) => (
                            <Link key={card.id} href="/wallet">
                                <Card className="border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-amber-500" />
                                                <span className="text-sm font-medium text-gray-900 truncate">
                                                    {card.nickname || card.details?.name || card.cardSlug}
                                                </span>
                                            </div>
                                            {card.isPrimary && (
                                                <Badge className="bg-amber-50 text-xs text-amber-700 border-amber-200">Primary</Badge>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-baseline justify-between">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {(card.pointsBalance ?? 0).toLocaleString()}
                                            </span>
                                            <span className="text-xs text-gray-400">
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
