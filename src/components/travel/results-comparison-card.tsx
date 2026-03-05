"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, Award, DollarSign, TrendingUp } from "lucide-react";
import ValueBadge from "./value-badge";
import type { RedemptionAnalysis } from "@/lib/travel/calculations";

// ─── Types ─────────────────────────────────────────────

interface ResultsComparisonCardProps {
    analysis: RedemptionAnalysis;
    origin: string;
    destination: string;
    cabin: string;
}

// ─── Constants ─────────────────────────────────────────

const CABIN_LABELS: Record<string, string> = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    business: "Business",
    first: "First",
};

// ─── Component ─────────────────────────────────────────

export default function ResultsComparisonCard({
    analysis,
    origin,
    destination,
    cabin,
}: ResultsComparisonCardProps) {
    return (
        <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Redemption Analysis
                    </CardTitle>
                    <ValueBadge tier={analysis.valueTier} cpm={analysis.centsPerMile} />
                </div>
                <p className="text-xs text-gray-400">
                    {origin} → {destination} · {CABIN_LABELS[cabin] || cabin}
                </p>
            </CardHeader>
            <CardContent>
                {/* Miles vs Cash Comparison */}
                <div className="mb-4 grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                    {/* Miles Side */}
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                        <Award className="mx-auto mb-2 h-6 w-6 text-green-600" />
                        <p className="text-xs font-medium text-green-600">Aeroplan Miles</p>
                        <p className="text-2xl font-bold text-green-900">
                            {analysis.milesCost.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-green-500">
                            + ~${Math.round(analysis.estimatedTaxesCad)} taxes
                        </p>
                    </div>

                    {/* VS Divider */}
                    <div className="flex flex-col items-center gap-1">
                        <ArrowRightLeft className="h-4 w-4 text-gray-300" />
                        <span className="text-[10px] font-medium text-gray-400">VS</span>
                    </div>

                    {/* Cash Side */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                        <DollarSign className="mx-auto mb-2 h-6 w-6 text-gray-500" />
                        <p className="text-xs font-medium text-gray-500">Cash Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${analysis.cashPriceCad.toLocaleString("en-CA", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            })}
                        </p>
                        <p className="text-[10px] text-gray-400">CAD all-in</p>
                    </div>
                </div>

                {/* CPM Stat Row */}
                <div className="mb-4 grid grid-cols-3 gap-2 rounded-md bg-gray-50 p-3">
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Cents/Mile</p>
                        <p className={`text-lg font-bold ${analysis.tierColor}`}>
                            {analysis.centsPerMile}¢
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Value Rating</p>
                        <p className={`text-lg font-bold ${analysis.tierColor}`}>
                            {analysis.tierEmoji} {analysis.tierLabel}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Break-even</p>
                        <p className="text-lg font-bold text-gray-700">
                            ${analysis.breakEvenCashPrice.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Recommendation */}
                <div className={`rounded-lg p-4 ${analysis.valueTier === "exceptional" || analysis.valueTier === "great"
                        ? "border border-green-200 bg-green-50"
                        : analysis.valueTier === "good"
                            ? "border border-amber-200 bg-amber-50"
                            : "border border-red-200 bg-red-50"
                    }`}>
                    <p className={`text-sm font-medium ${analysis.valueTier === "exceptional" || analysis.valueTier === "great"
                            ? "text-green-800"
                            : analysis.valueTier === "good"
                                ? "text-amber-800"
                                : "text-red-800"
                        }`}>
                        💡 {analysis.recommendation}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
