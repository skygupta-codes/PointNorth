"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    MessageCircle,
    Crown,
    Sparkles,
    ArrowRight,
    Settings,
    CheckCircle2,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { isNativeApp } from "@/lib/native";

interface SubscriptionData {
    tier: string;
    features: {
        maxCards: number;
        maxChatPerDay: number;
        hasCardsToConsider: boolean;
        hasTravelPlanner: boolean;
        hasExpertConsultations: boolean;
        hasExpiryAlerts: boolean;
    };
    usage: {
        chat: { used: number; limit: number };
        cards: { current: number; limit: number };
    };
}

const tierConfig: Record<string, { label: string; color: string; icon: React.ElementType; bg: string; border: string }> = {
    free: { label: "Free", color: "text-gray-600", icon: CreditCard, bg: "bg-gray-50", border: "border-gray-200" },
    plus: { label: "Plus", color: "text-amber-600", icon: Sparkles, bg: "bg-amber-50", border: "border-amber-200" },
    pro: { label: "Pro", color: "text-emerald-600", icon: Crown, bg: "bg-emerald-50", border: "border-emerald-200" },
};

export default function BillingPage() {
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);

    const fetchSubscription = useCallback(async () => {
        try {
            const res = await fetch("/api/subscription");
            if (!res.ok) throw new Error("Failed to fetch subscription");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Failed to fetch subscription:", err);
            toast.error("Failed to load billing info");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    async function handleManageBilling() {
        setPortalLoading(true);
        try {
            const res = await fetch("/api/stripe/portal", { method: "POST" });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to open billing portal");
            }
            const { url } = await res.json();
            window.location.href = url;
        } catch (err) {
            console.error("Portal error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
            setPortalLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="py-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">Billing</h1>
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2].map((i) => (
                        <Card key={i} className="border-gray-200 bg-white shadow-sm">
                            <CardContent className="space-y-4 p-6">
                                <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
                                <div className="h-10 w-20 animate-pulse rounded bg-gray-100" />
                                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const tier = data?.tier || "free";
    const config = tierConfig[tier] || tierConfig.free;
    const TierIcon = config.icon;

    // iOS App Store compliance: hide Stripe billing in native binary
    if (isNativeApp()) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
                <Settings className="mb-4 h-12 w-12 text-gray-400" />
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    Billing & Subscription
                </h1>
                <p className="mb-2 text-sm text-gray-600">
                    Current plan: <span className={`font-semibold ${config.color}`}>{config.label}</span>
                </p>
                <p className="mb-6 max-w-sm text-sm text-gray-500">
                    To manage your subscription, visit truenorthpoints.ca in Safari.
                </p>
                <a
                    href="https://truenorthpoints.ca/billing"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white active:bg-amber-600 transition-colors"
                >
                    Open in Safari <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
                <p className="mt-2 text-gray-500">Manage your subscription and view usage</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan */}
                <Card className={`border-2 bg-white shadow-sm ${config.border}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bg}`}>
                                <TierIcon className={`h-6 w-6 ${config.color}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                                    <Badge className={`${config.bg} ${config.color} border ${config.border}`}>
                                        Active
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {tier === "free" ? "Free forever" : tier === "plus" ? "$9.99 CAD/month" : "$24.99 CAD/month"}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {tier === "free" ? (
                                <Link href="/upgrade">
                                    <Button className="bg-amber-500 text-white active:bg-amber-600 min-h-[48px]">
                                        Upgrade Plan
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={handleManageBilling}
                                    disabled={portalLoading}
                                    className="border-gray-300"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    {portalLoading ? "Opening..." : "Manage Subscription"}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Stats */}
                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Usage Today</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Chat Usage */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">AI Chat Messages</p>
                                    <p className="text-xs text-gray-400">Resets daily at midnight</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                    {data?.usage.chat.used || 0}
                                    <span className="text-sm font-normal text-gray-400">
                                        /{data?.usage.chat.limit === Infinity ? "∞" : data?.usage.chat.limit || 5}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Card Usage */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                    <CreditCard className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Cards in Wallet</p>
                                    <p className="text-xs text-gray-400">Credit cards tracked</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                    {data?.usage.cards.current || 0}
                                    <span className="text-sm font-normal text-gray-400">
                                        /{data?.usage.cards.limit === Infinity ? "∞" : data?.usage.cards.limit || 3}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Feature Access */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="mb-2 text-xs font-medium text-gray-400">Feature Access</p>
                            <div className="flex flex-wrap gap-2">
                                {data?.features.hasCardsToConsider && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Full Recs
                                    </Badge>
                                )}
                                {data?.features.hasExpiryAlerts && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Expiry Alerts
                                    </Badge>
                                )}
                                {data?.features.hasTravelPlanner && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Travel Planner
                                    </Badge>
                                )}
                                {data?.features.hasExpertConsultations && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Expert Access
                                    </Badge>
                                )}
                                {tier === "free" && (
                                    <Link href="/upgrade">
                                        <Badge className="cursor-pointer bg-amber-50 text-amber-600 border-amber-200 active:bg-amber-100">
                                            Upgrade for more
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
