import { getAllCards } from "@/lib/cards";
import { WalletClient } from "@/components/wallet/wallet-client";
import { UserNav } from "@/components/auth/user-nav";

export const dynamic = "force-dynamic";

export default function WalletPage() {
    const cardCatalog = getAllCards();

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🍁</span>
                        <span className="text-xl font-bold tracking-tight">TrueNorthPoints</span>
                    </div>
                    <nav className="hidden items-center gap-6 md:flex">
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
                    <UserNav />
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <WalletClient cardCatalog={cardCatalog} />
            </main>
        </div>
    );
}
