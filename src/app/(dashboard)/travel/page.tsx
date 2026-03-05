"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Plane, Lock } from "lucide-react";
import FlightSearchForm from "@/components/travel/flight-search-form";
import ResultsComparisonCard from "@/components/travel/results-comparison-card";
import CashOptionsList from "@/components/travel/cash-options-list";
import ShortfallCard from "@/components/travel/shortfall-card";
import type { RedemptionAnalysis } from "@/lib/travel/calculations";

// ─── Types ─────────────────────────────────────────────

interface CashOption {
    totalCad: number;
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    durationMinutes: number;
    stops: number;
    offerId: string;
}

interface Shortfall {
    shortfall: number;
    canCover: boolean;
    strategy: {
        cardName: string;
        transferAmount: number;
        transferTime: string;
    } | null;
}

interface TransferCard {
    name: string;
    balance: number;
    currency: string;
}

interface SearchResult {
    origin: string;
    destination: string;
    departureDate: string;
    cabin: string;
    milesCost: number | null;
    cashOptions: CashOption[];
    analysis: RedemptionAnalysis | null;
    userAeroplanBalance: number;
    shortfall: Shortfall | null;
    transferableCards: TransferCard[];
    liveAvailability: null;
    availabilityNote: string;
}

// ─── Page Component ────────────────────────────────────

export default function TravelPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [needsUpgrade, setNeedsUpgrade] = useState(false);

    const handleSearch = useCallback(
        async (params: {
            origin: string;
            destination: string;
            departureDate: string;
            cabin: string;
        }) => {
            setIsLoading(true);
            setError(null);
            setResult(null);
            setNeedsUpgrade(false);

            try {
                const res = await fetch("/api/travel/flight-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(params),
                });

                const data = await res.json();

                if (res.status === 403 && data.upgrade) {
                    setNeedsUpgrade(true);
                    return;
                }

                if (!res.ok) {
                    setError(data.error || "Search failed");
                    return;
                }

                setResult(data);
            } catch {
                setError("Network error — please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return (
        <div className="py-8">
            {/* Hero */}
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <Plane className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Travel Planner
                        </h1>
                        <p className="text-sm text-gray-500">
                            Compare Aeroplan miles vs. cash prices to maximize your rewards
                        </p>
                    </div>
                    <Badge className="ml-auto bg-purple-50 text-purple-700 text-xs">
                        Pro Feature
                    </Badge>
                </div>
            </div>

            {/* Upgrade Banner */}
            {needsUpgrade && (
                <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-6 text-center">
                    <Lock className="mx-auto mb-3 h-8 w-8 text-purple-400" />
                    <h2 className="mb-1 text-lg font-semibold text-purple-900">
                        Pro Subscription Required
                    </h2>
                    <p className="mb-4 text-sm text-purple-600">
                        The Travel Planner is available exclusively for Pro subscribers.
                    </p>
                    <button
                        onClick={() => router.push("/upgrade")}
                        className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white active:bg-purple-700 transition-colors"
                    >
                        Upgrade to Pro
                    </button>
                </div>
            )}

            {/* Search Form */}
            <div className="mb-6">
                <FlightSearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm text-red-700">❌ {error}</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Analysis Card */}
                    {result.analysis && (
                        <ResultsComparisonCard
                            analysis={result.analysis}
                            origin={result.origin}
                            destination={result.destination}
                            cabin={result.cabin}
                        />
                    )}

                    {/* Two-Column Layout: Cash Options + Shortfall */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Cash Options */}
                        <CashOptionsList cashOptions={result.cashOptions} />

                        {/* Shortfall Card */}
                        {result.milesCost && result.shortfall && (
                            <ShortfallCard
                                aeroplanBalance={result.userAeroplanBalance}
                                milesCost={result.milesCost}
                                shortfall={result.shortfall}
                                transferableCards={result.transferableCards}
                            />
                        )}
                    </div>

                    {/* Availability Note */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                        <p className="text-sm text-blue-700">
                            ℹ️ {result.availabilityNote}
                        </p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!result && !error && !isLoading && !needsUpgrade && (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <Plane className="mx-auto mb-4 h-12 w-12 text-gray-200" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">
                        Ready to find the best deal?
                    </h3>
                    <p className="text-sm text-gray-400">
                        Enter your flight details above to compare Aeroplan miles against
                        cash prices and see your personalized redemption analysis.
                    </p>
                </div>
            )}
        </div>
    );
}
