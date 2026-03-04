"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Plane,
    Search,
    ArrowRight,
    TrendingUp,
    Award,
    MapPin,
    ArrowRightLeft,
    CreditCard,
} from "lucide-react";
import { getCardBySlug } from "@/lib/cards";
import {
    SWEET_SPOTS,
    RATING_STYLES,
    formatMiles,
    formatCPM,
} from "@/data/aeroplan-sweet-spots";
import {
    AWARD_CHART,
    CABIN_LABELS,
    CABIN_COLORS,
} from "@/data/aeroplan-award-chart";
import type { CabinClass } from "@/data/aeroplan-award-chart";
import {
    searchAirports,
    getAirport,
    getZonePairId,
    COUNTRY_FLAGS,
} from "@/data/aeroplan-zones";
import type { Airport } from "@/data/aeroplan-zones";

// ─── STATUS TRACKER ────────────────────────────────────

const STATUS_TIERS = [
    { name: "Member", threshold: 0 },
    { name: "25K", threshold: 25000 },
    { name: "35K", threshold: 35000 },
    { name: "50K", threshold: 50000 },
    { name: "75K", threshold: 75000 },
    { name: "Super Elite", threshold: 100000 },
];

function StatusTracker({ balance }: { balance: number | null }) {
    if (balance === null) {
        return (
            <Card className="border-gray-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                        Track your Aeroplan status
                    </p>
                    <p className="mb-4 text-xs text-gray-400">
                        Add an Aeroplan account in your Loyalty page to see your status progress here.
                    </p>
                    <a href="/loyalty">
                        <Button
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                            Add Aeroplan Account
                        </Button>
                    </a>
                </CardContent>
            </Card>
        );
    }

    const currentTierIndex = STATUS_TIERS.findLastIndex(
        (t) => balance >= t.threshold
    );
    const currentTier = STATUS_TIERS[currentTierIndex] || STATUS_TIERS[0];
    const nextTier = STATUS_TIERS[currentTierIndex + 1];
    const progress = nextTier
        ? ((balance - currentTier.threshold) /
            (nextTier.threshold - currentTier.threshold)) *
        100
        : 100;

    return (
        <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-5 w-5 text-green-600" />
                    Aeroplan Status Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {balance.toLocaleString()} pts
                        </p>
                        <p className="text-sm text-gray-500">
                            Current tier:{" "}
                            <span className="font-medium text-green-700">
                                {currentTier.name}
                            </span>
                        </p>
                    </div>
                    {nextTier && (
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Next tier</p>
                            <p className="font-semibold text-gray-900">
                                {nextTier.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {(nextTier.threshold - balance).toLocaleString()} pts to go
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="relative mb-2">
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Tier markers */}
                <div className="flex justify-between">
                    {STATUS_TIERS.map((tier) => (
                        <div key={tier.name} className="text-center">
                            <div
                                className={`mx-auto mb-1 h-2 w-2 rounded-full ${balance >= tier.threshold
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                    }`}
                            />
                            <p
                                className={`text-[10px] ${balance >= tier.threshold
                                    ? "font-semibold text-green-700"
                                    : "text-gray-400"
                                    }`}
                            >
                                {tier.name}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── ZONE CALCULATOR ───────────────────────────────────

function ZoneCalculator() {
    const [originQuery, setOriginQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");
    const [originResults, setOriginResults] = useState<Airport[]>([]);
    const [destResults, setDestResults] = useState<Airport[]>([]);
    const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null);
    const [selectedDest, setSelectedDest] = useState<Airport | null>(null);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);

    useEffect(() => {
        setOriginResults(searchAirports(originQuery));
    }, [originQuery]);

    useEffect(() => {
        setDestResults(searchAirports(destQuery));
    }, [destQuery]);

    const zonePairId =
        selectedOrigin && selectedDest
            ? getZonePairId(selectedOrigin.zone, selectedDest.zone)
            : null;

    const zoneData = zonePairId
        ? AWARD_CHART.find((z) => z.id === zonePairId)
        : null;

    return (
        <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-5 w-5 text-green-600" />
                    Zone Calculator
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6 grid gap-3 sm:grid-cols-[1fr,auto,1fr]">
                    {/* Origin */}
                    <div className="relative">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            From
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="City or airport code"
                                value={originQuery}
                                onChange={(e) => {
                                    setOriginQuery(e.target.value);
                                    setSelectedOrigin(null);
                                    setShowOriginDropdown(true);
                                }}
                                onFocus={() => setShowOriginDropdown(true)}
                                onBlur={() =>
                                    setTimeout(() => setShowOriginDropdown(false), 200)
                                }
                                className="pl-9"
                            />
                        </div>
                        {showOriginDropdown && originResults.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                {originResults.map((a) => (
                                    <button
                                        key={a.code}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-green-50"
                                        onMouseDown={() => {
                                            setSelectedOrigin(a);
                                            setOriginQuery(
                                                `${COUNTRY_FLAGS[a.country] || ""} ${a.code} — ${a.city}`
                                            );
                                            setShowOriginDropdown(false);
                                        }}
                                    >
                                        <span>{COUNTRY_FLAGS[a.country]}</span>
                                        <span className="font-mono font-semibold">
                                            {a.code}
                                        </span>
                                        <span className="text-gray-500">{a.city}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <div className="hidden items-end justify-center pb-2 sm:flex">
                        <ArrowRight className="h-5 w-5 text-gray-300" />
                    </div>

                    {/* Destination */}
                    <div className="relative">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            To
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="City or airport code"
                                value={destQuery}
                                onChange={(e) => {
                                    setDestQuery(e.target.value);
                                    setSelectedDest(null);
                                    setShowDestDropdown(true);
                                }}
                                onFocus={() => setShowDestDropdown(true)}
                                onBlur={() =>
                                    setTimeout(() => setShowDestDropdown(false), 200)
                                }
                                className="pl-9"
                            />
                        </div>
                        {showDestDropdown && destResults.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                {destResults.map((a) => (
                                    <button
                                        key={a.code}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-green-50"
                                        onMouseDown={() => {
                                            setSelectedDest(a);
                                            setDestQuery(
                                                `${COUNTRY_FLAGS[a.country] || ""} ${a.code} — ${a.city}`
                                            );
                                            setShowDestDropdown(false);
                                        }}
                                    >
                                        <span>{COUNTRY_FLAGS[a.country]}</span>
                                        <span className="font-mono font-semibold">
                                            {a.code}
                                        </span>
                                        <span className="text-gray-500">{a.city}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                {zoneData && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="mb-3 text-sm font-medium text-green-800">
                            {zoneData.name}
                        </p>
                        <p className="mb-4 text-xs text-green-600">
                            {zoneData.description}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {(
                                Object.keys(CABIN_LABELS) as CabinClass[]
                            ).map((cabin) => (
                                <div
                                    key={cabin}
                                    className={`rounded-md p-3 ${CABIN_COLORS[cabin]}`}
                                >
                                    <p className="text-xs font-medium opacity-70">
                                        {CABIN_LABELS[cabin]}
                                    </p>
                                    <p className="text-lg font-bold">
                                        {zoneData.fixedMileage[cabin].toLocaleString()}
                                    </p>
                                    <p className="text-[10px] opacity-50">
                                        pts one-way (fixed)
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedOrigin && selectedDest && !zoneData && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                        Zone pricing not available for this route pair. Try
                        routing through a Canadian gateway.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── SWEET SPOTS GRID ──────────────────────────────────

function SweetSpotsGrid() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SWEET_SPOTS.map((spot) => {
                const rating = RATING_STYLES[spot.rating];
                return (
                    <Card
                        key={spot.id}
                        className="group border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-sm font-semibold text-gray-900">
                                        {spot.title}
                                    </CardTitle>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {spot.airline}
                                    </p>
                                </div>
                                <Badge
                                    className={`shrink-0 text-[10px] ${rating.color}`}
                                >
                                    {rating.icon} {rating.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-1">
                            {/* Route */}
                            <div className="mb-3 flex items-center gap-2 text-sm">
                                <span className="font-mono font-semibold text-gray-700">
                                    {spot.origin}
                                </span>
                                <Plane className="h-3 w-3 text-green-500" />
                                <span className="font-mono font-semibold text-gray-700">
                                    {spot.destination}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className={`ml-auto text-[10px] ${CABIN_COLORS[spot.cabin]}`}
                                >
                                    {CABIN_LABELS[spot.cabin]}
                                </Badge>
                            </div>

                            {/* Stats */}
                            <div className="mb-3 grid grid-cols-3 gap-2 rounded-md bg-gray-50 p-2">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">Miles</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {formatMiles(spot.milesOneWay)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">Cash</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        ${(spot.cashValueCAD / 1000).toFixed(
                                            spot.cashValueCAD >= 10000 ? 0 : 1
                                        )}K
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">CPM</p>
                                    <p className="text-sm font-bold text-emerald-700">
                                        {formatCPM(spot.cpm)}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="mb-2 text-xs text-gray-600 line-clamp-2">
                                {spot.description}
                            </p>

                            {/* Tip */}
                            <div className="rounded bg-amber-50 px-2 py-1.5">
                                <p className="text-[10px] text-amber-700">
                                    💡 {spot.tip}
                                </p>
                            </div>

                            {/* Season */}
                            <p className="mt-2 text-[10px] text-gray-400">
                                📅 Best: {spot.popularMonths}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

// ─── TRANSFER PARTNERS ─────────────────────────────────

const AEROPLAN_TRANSFER_CURRENCIES = ["mr", "td-points", "rbc-avion", "cibc-aventura"] as const;

const TRANSFER_TIME_MAP: Record<string, string> = {
    "mr": "1–3 business days",
    "td-points": "Instant",
    "rbc-avion": "1–2 business days",
    "cibc-aventura": "1–2 business days",
};

interface TransferCard {
    name: string;
    issuer: string;
    balance: number;
    currency: string;
    transferTime: string;
}

function TransferPartners() {
    const [transferCards, setTransferCards] = useState<TransferCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCards() {
            try {
                const res = await fetch("/api/cards");
                if (!res.ok) return;
                const data = await res.json();
                const matched: TransferCard[] = [];
                for (const uc of data.cards || []) {
                    const details = getCardBySlug(uc.cardSlug);
                    if (!details) continue;
                    const currency = details.rewardsCurrency.toLowerCase();
                    if ((AEROPLAN_TRANSFER_CURRENCIES as readonly string[]).includes(currency)) {
                        matched.push({
                            name: details.name,
                            issuer: details.issuer,
                            balance: uc.pointsBalance ?? 0,
                            currency,
                            transferTime: TRANSFER_TIME_MAP[currency] || "Varies",
                        });
                    }
                }
                setTransferCards(matched);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        }
        fetchCards();
    }, []);

    if (loading) {
        return (
            <Card className="border-gray-200 bg-white shadow-sm">
                <CardContent className="flex items-center justify-center p-8">
                    <p className="text-sm text-gray-400">Loading transfer partners…</p>
                </CardContent>
            </Card>
        );
    }

    const totalTransferable = transferCards.reduce((sum, c) => sum + c.balance, 0);

    if (transferCards.length === 0) {
        return (
            <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ArrowRightLeft className="h-5 w-5 text-green-600" />
                        Transfer Partners
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                        <CreditCard className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                        <p className="mb-3 text-sm text-gray-600">
                            None of your current cards transfer to Aeroplan. Consider:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Badge className="bg-blue-50 text-blue-700">
                                Amex Cobalt — earn 5x MR, transfer 1:1
                            </Badge>
                            <Badge className="bg-green-50 text-green-700">
                                TD Aeroplan Visa Infinite
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowRightLeft className="h-5 w-5 text-green-600" />
                    Transfer Partners
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-gray-100">
                    {transferCards.map((tc, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                        >
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {tc.name}
                                </p>
                                <p className="text-xs text-gray-400">{tc.issuer}</p>
                            </div>
                            <div className="mx-4 text-right">
                                <p className="text-sm font-bold text-gray-900">
                                    {tc.balance.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-gray-400">{tc.currency}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge className="bg-green-50 text-green-700 text-[10px]">
                                    1:1 → Aeroplan
                                </Badge>
                                <span className="text-[10px] text-gray-400">
                                    {tc.transferTime}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total row */}
                <div className="mt-4 flex items-center justify-between rounded-md bg-green-50 px-4 py-3">
                    <p className="text-sm font-medium text-green-800">
                        Total transferable
                    </p>
                    <p className="text-lg font-bold text-green-900">
                        {totalTransferable.toLocaleString()} miles
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── MAIN PAGE ─────────────────────────────────────────

export default function AeroplanPage() {
    const [aeroplanBalance, setAeroplanBalance] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<
        "sweet-spots" | "calculator" | "chart"
    >("sweet-spots");

    const fetchLoyaltyAccounts = useCallback(async () => {
        try {
            const res = await fetch("/api/loyalty-accounts");
            if (!res.ok) return;
            const data = await res.json();
            const aeroplan = data.accounts?.find(
                (a: { program: string }) => a.program === "aeroplan"
            );
            if (aeroplan) {
                setAeroplanBalance(aeroplan.currentBalance || 0);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        fetchLoyaltyAccounts();
    }, [fetchLoyaltyAccounts]);

    const tabs = [
        { id: "sweet-spots" as const, label: "Sweet Spots", icon: "🌟" },
        { id: "calculator" as const, label: "Zone Calculator", icon: "🧮" },
        { id: "chart" as const, label: "Award Chart", icon: "📊" },
    ];

    return (
        <div className="py-8">
            {/* Hero */}
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <span className="text-lg">✈️</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Aeroplan Hub
                        </h1>
                        <p className="text-sm text-gray-500">
                            Maximize your Aeroplan points with our award
                            calculator and sweet spots guide
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Tracker */}
            <div className="mb-6">
                <StatusTracker balance={aeroplanBalance} />
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "sweet-spots" && <SweetSpotsGrid />}
            {activeTab === "calculator" && <ZoneCalculator />}
            {activeTab === "chart" && (
                <div className="space-y-4">
                    {AWARD_CHART.map((zone) => (
                        <Card
                            key={zone.id}
                            className="border-gray-200 bg-white shadow-sm"
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-gray-900">
                                    {zone.name}
                                </CardTitle>
                                <p className="text-xs text-gray-400">
                                    {zone.description}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {(
                                        Object.keys(CABIN_LABELS) as CabinClass[]
                                    ).map((cabin) => (
                                        <div
                                            key={cabin}
                                            className={`rounded-md p-3 ${CABIN_COLORS[cabin]}`}
                                        >
                                            <p className="text-xs font-medium opacity-70">
                                                {CABIN_LABELS[cabin]}
                                            </p>
                                            <p className="text-lg font-bold">
                                                {zone.fixedMileage[
                                                    cabin
                                                ].toLocaleString()}
                                            </p>
                                            <p className="text-[10px] opacity-50">
                                                pts one-way
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Transfer Partners */}
            <div className="mt-6">
                <TransferPartners />
            </div>
        </div>
    );
}
