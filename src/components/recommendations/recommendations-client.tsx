"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    TrendingUp,
    AlertTriangle,
    Sparkles,
    ArrowRight,
    DollarSign,
} from "lucide-react";

const categoryEmojis: Record<string, string> = {
    groceries: "🛒", dining: "🍽️", gas: "⛽", travel: "✈️",
    streaming: "📺", shopping: "🛍️", transit: "🚇", other: "💳",
};
const categoryLabels: Record<string, string> = {
    groceries: "Groceries", dining: "Dining", gas: "Gas", travel: "Travel",
    streaming: "Streaming", shopping: "Shopping", transit: "Transit", other: "Other",
};

interface RecommendationsData {
    hasData: boolean;
    message?: string;
    categoryRecommendations?: Array<{
        category: string;
        bestCard: { name: string; slug: string; network: string; issuer: string };
        earnRate: number;
        monthlySpend: number;
        monthlyPointsEarned: number;
    }>;
    cardsToConsider?: Array<{
        card: { name: string; slug: string; issuer: string; network: string; annualFee: number; rewardsCurrency: string };
        annualValue: number;
        annualPointsEarned: number;
        bestCategory: string;
        bestCategoryRate: number;
    }>;
    walletValue?: number;
    missed?: {
        bestPossibleValue: number;
        currentValue: number;
        missedValue: number;
        bestNewCard: {
            card: { name: string; issuer: string; annualFee: number };
            annualValue: number;
        } | null;
    };
    walletSize?: number;
}

const networkColors: Record<string, string> = {
    visa: "bg-blue-500",
    mastercard: "bg-orange-500",
    amex: "bg-sky-500",
};

export function RecommendationsClient() {
    const [data, setData] = useState<RecommendationsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/recommendations");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    if (!data?.hasData) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                    <Sparkles className="h-8 w-8 text-amber-500" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">Set up to get recommendations</h2>
                <p className="mb-6 max-w-md text-center text-sm text-gray-500">
                    {data?.message || "Add cards to your wallet and set up your spending profile to get personalized recommendations."}
                </p>
                <div className="flex gap-3">
                    <Link href="/wallet">
                        <Button variant="outline" className="border-gray-200 text-gray-700 hover:text-gray-900">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Add Cards
                        </Button>
                    </Link>
                    <Link href="/spending">
                        <Button className="bg-amber-500 text-white hover:bg-amber-600">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Set Up Spending
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const { categoryRecommendations, cardsToConsider, walletValue, missed } = data;

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Recommendations</h1>
                <p className="mt-2 text-gray-500">Smart card picks based on your spending profile.</p>
            </div>

            {/* Value Summary */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Your Wallet Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">
                            ${Math.round(walletValue || 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Estimated annual net value</p>
                    </CardContent>
                </Card>

                <Card className={`border-gray-200 bg-white shadow-sm ${(missed?.missedValue || 0) > 50 ? "border-amber-300" : ""}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Opportunity Gap</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${(missed?.missedValue || 0) > 50 ? "text-amber-500" : "text-gray-300"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${(missed?.missedValue || 0) > 50 ? "text-amber-600" : "text-gray-900"}`}>
                            ${Math.round(missed?.missedValue || 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Value you could unlock with new cards</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Best Possible</CardTitle>
                        <Sparkles className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">
                            ${Math.round(missed?.bestPossibleValue || 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">If you had the optimal card for every category</p>
                    </CardContent>
                </Card>
            </div>

            {/* Which Card Should I Use? */}
            {categoryRecommendations && categoryRecommendations.length > 0 && (
                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold flex items-center gap-2 text-gray-900">
                        <CreditCard className="h-5 w-5 text-amber-500" />
                        Which Card Should I Use?
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {categoryRecommendations.map((rec) => (
                            <Card key={rec.category} className="border-gray-200 bg-white shadow-sm">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="text-2xl">{categoryEmojis[rec.category] || "💳"}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {categoryLabels[rec.category] || rec.category}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${networkColors[rec.bestCard.network] || "bg-gray-400"}`} />
                                            <p className="text-xs text-gray-500 truncate">{rec.bestCard.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">{rec.earnRate}x</Badge>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {Math.round(rec.monthlyPointsEarned).toLocaleString()} pts/mo
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Cards You Should Consider */}
            {cardsToConsider && cardsToConsider.length > 0 && (
                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold flex items-center gap-2 text-gray-900">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Cards You Should Consider
                    </h2>
                    <div className="space-y-3">
                        {cardsToConsider.map((rec, i) => (
                            <Card key={rec.card.slug} className={`border-gray-200 bg-white shadow-sm ${i === 0 ? "border-amber-300" : ""}`}>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white ${i === 0 ? "bg-amber-500" : "bg-gray-300"}`}>
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{rec.card.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {rec.card.issuer} · {rec.card.annualFee === 0 ? "No fee" : `$${rec.card.annualFee}/yr`} · Best for {categoryLabels[rec.bestCategory] || rec.bestCategory} ({rec.bestCategoryRate}x)
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-bold text-emerald-600">+${Math.round(rec.annualValue).toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">/year net</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <Link href="/wallet">
                            <Button variant="outline" className="border-gray-200 text-gray-700 hover:text-gray-900">
                                Add a Card to Your Wallet <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
