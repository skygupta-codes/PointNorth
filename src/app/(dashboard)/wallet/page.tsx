import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WalletPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🍁</span>
                        <span className="text-xl font-bold tracking-tight">PointsNorth</span>
                    </div>
                    <nav className="ml-8 hidden items-center gap-6 md:flex">
                        <a href="/dashboard" className="text-sm font-medium text-zinc-400 transition hover:text-amber-400">
                            Dashboard
                        </a>
                        <a href="/wallet" className="text-sm font-medium text-white transition hover:text-amber-400">
                            My Wallet
                        </a>
                        <a href="/chat" className="text-sm font-medium text-zinc-400 transition hover:text-amber-400">
                            Chat with Maple
                        </a>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Wallet</h1>
                        <p className="mt-2 text-zinc-400">Manage your credit cards and track rewards.</p>
                    </div>
                    <Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                        + Add Card
                    </Button>
                </div>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                            <CreditCard className="h-8 w-8 text-zinc-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">
                            No cards in your wallet yet
                        </h3>
                        <p className="mb-6 max-w-sm text-center text-sm text-zinc-400">
                            Start by adding your Canadian credit cards. We&apos;ll help you track
                            points and find the best card for every purchase.
                        </p>
                        <Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                            Add Your First Card
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
