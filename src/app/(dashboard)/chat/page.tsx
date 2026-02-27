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
        <>
            <div className="flex flex-1 flex-col items-center justify-center py-12">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-emerald-100">
                    <span className="text-4xl">🍁</span>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Meet Maple</h2>
                <p className="mb-8 max-w-md text-center text-gray-500">
                    Your AI rewards advisor. Ask me anything about Canadian credit cards,
                    points, and how to maximize your rewards.
                </p>

                <div className="mb-8 grid gap-3 sm:grid-cols-2">
                    {suggestedPrompts.map((prompt) => (
                        <Card
                            key={prompt}
                            className="cursor-pointer border-gray-200 bg-white shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
                        >
                            <CardContent className="flex items-center gap-3 p-4">
                                <MessageCircle className="h-4 w-4 shrink-0 text-amber-500" />
                                <span className="text-sm text-gray-700">{prompt}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Badge variant="secondary" className="bg-gray-100 text-gray-400">
                    Powered by Claude AI
                </Badge>
            </div>

            <div className="sticky bottom-0 border-t border-gray-200 bg-white pt-4 pb-6">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                    <Input
                        placeholder="Ask Maple about your rewards..."
                        className="flex-1 border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400"
                        disabled
                    />
                    <Button className="bg-amber-500 text-white hover:bg-amber-600" disabled>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <p className="mt-2 text-center text-xs text-gray-400">
                    Chat functionality will be enabled in Day 4
                </p>
            </div>
        </>
    );
}
