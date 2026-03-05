"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, CheckCircle, XCircle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────

interface TransferCard {
    name: string;
    balance: number;
    currency: string;
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

interface ShortfallCardProps {
    aeroplanBalance: number;
    milesCost: number;
    shortfall: Shortfall;
    transferableCards: TransferCard[];
}

// ─── Component ─────────────────────────────────────────

export default function ShortfallCard({
    aeroplanBalance,
    milesCost,
    shortfall,
    transferableCards,
}: ShortfallCardProps) {
    const hasEnoughMiles = shortfall.shortfall === 0;

    return (
        <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    {hasEnoughMiles ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    Miles Balance
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Balance Summary */}
                <div className="mb-4 grid grid-cols-3 gap-2 rounded-md bg-gray-50 p-3">
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Aeroplan</p>
                        <p className="text-sm font-bold text-gray-900">
                            {aeroplanBalance.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Needed</p>
                        <p className="text-sm font-bold text-gray-900">
                            {milesCost.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Shortfall</p>
                        <p className={`text-sm font-bold ${hasEnoughMiles ? "text-green-600" : "text-red-500"}`}>
                            {hasEnoughMiles
                                ? "None ✓"
                                : `-${shortfall.shortfall.toLocaleString()}`}
                        </p>
                    </div>
                </div>

                {/* Status */}
                {hasEnoughMiles ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                            ✅ You have enough Aeroplan miles for this redemption!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Strategy */}
                        {shortfall.strategy ? (
                            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <p className="mb-2 text-sm font-medium text-amber-800">
                                    🔄 Recommended Transfer Strategy
                                </p>
                                <div className="flex items-center gap-2 text-sm text-amber-700">
                                    <span className="font-medium">
                                        {shortfall.strategy.cardName}
                                    </span>
                                    <ArrowRight className="h-3 w-3" />
                                    <span>
                                        {shortfall.strategy.transferAmount.toLocaleString()} pts → Aeroplan
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-amber-600">
                                    ⏱️ Transfer time: {shortfall.strategy.transferTime}
                                </p>
                            </div>
                        ) : (
                            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-4">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <p className="text-sm font-medium text-red-800">
                                        Not enough transferable points to cover the shortfall.
                                    </p>
                                </div>
                                <p className="mt-1 text-xs text-red-600">
                                    Consider buying Aeroplan points directly or exploring cash pricing.
                                </p>
                            </div>
                        )}

                        {/* Transferable Cards List */}
                        {transferableCards.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-2 text-xs font-medium text-gray-500">
                                    Your Transferable Cards
                                </p>
                                <div className="divide-y divide-gray-100">
                                    {transferableCards.map((tc, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {tc.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {tc.balance.toLocaleString()}
                                                </span>
                                                <Badge className="bg-green-50 text-green-700 text-[10px]">
                                                    1:1
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
