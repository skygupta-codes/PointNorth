import { UserNav } from "@/components/auth/user-nav";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    let firstName = "there";

    try {
        const user = await currentUser();
        if (!user) redirect("/sign-in");
        firstName = user.firstName || "there";
    } catch {
        // Clerk not configured yet — show dashboard shell
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🍁</span>
                        <span className="text-xl font-bold tracking-tight">TrueNorthPoints</span>
                    </div>
                    <nav className="hidden items-center gap-6 md:flex">
                        <a
                            href="/dashboard"
                            className="text-sm font-medium text-white transition hover:text-amber-400"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/wallet"
                            className="text-sm font-medium text-zinc-400 transition hover:text-amber-400"
                        >
                            My Wallet
                        </a>
                        <a
                            href="/chat"
                            className="text-sm font-medium text-zinc-400 transition hover:text-amber-400"
                        >
                            Chat with Maple
                        </a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <UserNav />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-8">
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
                            <div className="text-3xl font-bold text-white">0</div>
                            <p className="mt-1 text-xs text-zinc-500">
                                Add cards to track your points
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
                            <div className="text-3xl font-bold text-white">0</div>
                            <p className="mt-1 text-xs text-zinc-500">
                                No cards added yet
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">
                                Expiring Soon
                            </CardTitle>
                            <Bell className="h-4 w-4 text-rose-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">0</div>
                            <p className="mt-1 text-xs text-zinc-500">
                                No upcoming expirations
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-amber-500/50 hover:bg-zinc-900">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                                    <Plus className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Add Your First Card</h3>
                                    <p className="text-sm text-zinc-400">
                                        Start tracking rewards by adding a credit card
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="ml-auto bg-amber-500/10 text-amber-400"
                                >
                                    Get Started
                                </Badge>
                            </CardContent>
                        </Card>

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
                    </div>
                </div>

                {/* Empty Wallet State */}
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
                        <Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                            <Plus className="mr-2 h-4 w-4" />
                            Add a Card
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
