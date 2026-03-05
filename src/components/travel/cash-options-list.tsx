"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Plane, DollarSign } from "lucide-react";

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

interface CashOptionsListProps {
    cashOptions: CashOption[];
}

// ─── Helpers ───────────────────────────────────────────

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

function formatTime(isoStr: string): string {
    if (!isoStr) return "—";
    try {
        const d = new Date(isoStr);
        return d.toLocaleTimeString("en-CA", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return isoStr.slice(11, 16);
    }
}

// ─── Component ─────────────────────────────────────────

export default function CashOptionsList({ cashOptions }: CashOptionsListProps) {
    if (cashOptions.length === 0) {
        return (
            <Card className="border-gray-200 bg-white shadow-sm">
                <CardContent className="flex items-center justify-center p-6">
                    <p className="text-sm text-gray-400">
                        No cash flight prices available for this route.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Cash Prices (CAD)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-gray-100">
                    {cashOptions.map((opt, i) => (
                        <div
                            key={opt.offerId}
                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Plane className="h-3 w-3 text-gray-400" />
                                    <p className="text-sm font-medium text-gray-900">
                                        {opt.airline}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                        {opt.flightNumber}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                    <span>
                                        {formatTime(opt.departureTime)} → {formatTime(opt.arrivalTime)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(opt.durationMinutes)}
                                    </span>
                                    <span>
                                        {opt.stops === 0
                                            ? "Nonstop"
                                            : `${opt.stops} stop${opt.stops > 1 ? "s" : ""}`}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                    ${opt.totalCad.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                {i === 0 && (
                                    <span className="text-[10px] text-green-600 font-medium">
                                        Cheapest
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
