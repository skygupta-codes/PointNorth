"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Loader2, Trash2 } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_PROMPTS = [
    "Which card should I use at the grocery store?",
    "What's my best card for dining out?",
    "How can I maximize my Aeroplan miles?",
    "Is my annual fee worth it?",
    "Which card should I get next?",
    "How much value am I getting from my wallet?",
];

export function ChatClient() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 100);
    }, []);

    // Load chat history
    useEffect(() => {
        async function loadHistory() {
            try {
                const res = await fetch("/api/chat");
                const data = await res.json();
                if (data.messages) {
                    setMessages(
                        data.messages.map((m: { role: string; content: string }) => ({
                            role: m.role as "user" | "assistant",
                            content: m.content,
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load chat history:", err);
            } finally {
                setHistoryLoading(false);
            }
        }
        loadHistory();
    }, []);

    useEffect(() => {
        if (messages.length > 0) scrollToBottom();
    }, [messages, scrollToBottom]);

    async function sendMessage(text: string) {
        if (!text.trim() || loading) return;

        const userMsg: ChatMessage = { role: "user", content: text.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text.trim(),
                    history: messages,
                }),
            });

            const data = await res.json();

            if (res.ok && data.reply) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.reply },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Sorry, I had trouble processing that. Please try again! 🍁",
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Network error — please check your connection and try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleClear() {
        setMessages([]);
    }

    if (historyLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-3xl">🍁</span> Chat with Maple
                    </h1>
                    <p className="text-sm text-gray-500">
                        Your AI-powered Canadian credit card rewards advisor
                    </p>
                </div>
                {messages.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Clear Chat
                    </Button>
                )}
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-emerald-100">
                            <span className="text-4xl">🍁</span>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">
                            Hi! I&apos;m Maple
                        </h2>
                        <p className="mb-8 max-w-md text-center text-sm text-gray-500">
                            Ask me anything about your Canadian credit cards, rewards,
                            or which card to use for your next purchase!
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 max-w-lg w-full">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm text-gray-700 transition hover:border-amber-300 hover:bg-amber-50"
                                >
                                    <MessageCircle className="h-4 w-4 shrink-0 text-amber-500" />
                                    <span>{prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                            ? "bg-amber-500 text-white"
                                            : "bg-gray-100 text-gray-900"
                                        }`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                            <span>🍁</span> Maple
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Maple is thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="mt-4 flex items-center gap-3">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(input);
                        }
                    }}
                    placeholder="Ask Maple about your rewards..."
                    className="flex-1 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                    disabled={loading}
                />
                <Button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
