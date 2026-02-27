import { MessageCircle, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
    const suggestedPrompts = [
        "Which card should I use at the grocery store?",
        "What's my best card for dining out?",
        "How do I maximize Aeroplan miles?",
        "When do my points expire?",
    ];

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
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
                        <a href="/wallet" className="text-sm font-medium text-zinc-400 transition hover:text-amber-400">
                            My Wallet
                        </a>
                        <a href="/chat" className="text-sm font-medium text-white transition hover:text-amber-400">
                            Chat with Maple
                        </a>
                    </nav>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
                {/* Chat Area */}
                <div className="flex flex-1 flex-col items-center justify-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20">
                        <span className="text-4xl">🍁</span>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold">Meet Maple</h2>
                    <p className="mb-8 max-w-md text-center text-zinc-400">
                        Your AI rewards advisor. Ask me anything about Canadian credit cards,
                        points, and how to maximize your rewards.
                    </p>

                    {/* Suggested Prompts */}
                    <div className="mb-8 grid gap-3 sm:grid-cols-2">
                        {suggestedPrompts.map((prompt) => (
                            <Card
                                key={prompt}
                                className="cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-amber-500/50 hover:bg-zinc-900"
                            >
                                <CardContent className="flex items-center gap-3 p-4">
                                    <MessageCircle className="h-4 w-4 shrink-0 text-amber-400" />
                                    <span className="text-sm text-zinc-300">{prompt}</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                        Powered by Claude AI
                    </Badge>
                </div>

                {/* Input Area */}
                <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950 pt-4 pb-6">
                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="Ask Maple about your rewards..."
                            className="flex-1 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
                            disabled
                        />
                        <Button
                            className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
                            disabled
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="mt-2 text-center text-xs text-zinc-600">
                        Chat functionality will be enabled in Day 4
                    </p>
                </div>
            </main>
        </div>
    );
}
