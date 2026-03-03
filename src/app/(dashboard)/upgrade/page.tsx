"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Check,
    CreditCard,
    Sparkles,
    Crown,
    ArrowRight,
    MessageCircle,
    Plane,
    Users,
    Bell,
} from "lucide-react";
import { toast } from "sonner";

const plans = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        period: "",
        description: "Get started with the basics",
        icon: CreditCard,
        color: "gray",
        features: [
            "Track up to 3 credit cards",
            "5 AI chat queries per day",
            "Basic card recommendations",
            "Spending profile setup",
        ],
        limitations: [
            "No \"Cards You Don't Have\" recommendations",
            "No points expiry alerts",
            "No travel planner",
        ],
        cta: "Current Plan",
        popular: false,
    },
    {
        id: "plus",
        name: "Plus",
        price: "$9.99",
        period: "/mo CAD",
        description: "For active rewards optimizers",
        icon: Sparkles,
        color: "amber",
        features: [
            "Unlimited credit cards",
            "Unlimited AI chat with Maple",
            "Full card recommendations",
            "\"Cards You Don't Have\" suggestions",
            "Points expiry alerts",
            "Spending profile analytics",
        ],
        limitations: [
            "No travel planner",
            "No expert consultations",
        ],
        cta: "Upgrade to Plus",
        popular: true,
    },
    {
        id: "pro",
        name: "Pro",
        price: "$24.99",
        period: "/mo CAD",
        description: "The complete rewards toolkit",
        icon: Crown,
        color: "emerald",
        features: [
            "Everything in Plus",
            "Travel on Points planner",
            "Flight award calculator",
            "Live award seat availability",
            "Expert consultations",
            "Priority support",
        ],
        limitations: [],
        cta: "Upgrade to Pro",
        popular: false,
    },
];

const featureComparison = [
    { feature: "Credit cards tracked", free: "3", plus: "Unlimited", pro: "Unlimited", icon: CreditCard },
    { feature: "AI chat with Maple", free: "5/day", plus: "Unlimited", pro: "Unlimited", icon: MessageCircle },
    { feature: "Card recommendations", free: "Basic", plus: "Full", pro: "Full", icon: Sparkles },
    { feature: "Points expiry alerts", free: "—", plus: "✓", pro: "✓", icon: Bell },
    { feature: "Travel planner", free: "—", plus: "—", pro: "✓", icon: Plane },
    { feature: "Expert consultations", free: "—", plus: "—", pro: "✓", icon: Users },
];

export default function UpgradePage() {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    async function handleUpgrade(tier: string) {
        if (tier === "free") return;
        setLoading(tier);

        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to start checkout");
            }

            const { url } = await res.json();
            if (url) {
                router.push(url);
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to start checkout");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-12 text-center">
                <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-200">
                    🍁 TrueNorthPoints Plans
                </Badge>
                <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                    Maximize Every Canadian Reward
                </h1>
                <p className="mx-auto max-w-2xl text-gray-500">
                    Choose the plan that fits your rewards journey. Upgrade anytime, cancel anytime.
                </p>
            </div>

            {/* Plan Cards */}
            <div className="mx-auto mb-16 grid max-w-5xl gap-6 md:grid-cols-3">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isLoading = loading === plan.id;
                    const colorMap: Record<string, { bg: string; text: string; border: string; button: string }> = {
                        gray: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", button: "bg-gray-200 text-gray-500 cursor-default" },
                        amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-300", button: "bg-amber-500 text-white hover:bg-amber-600" },
                        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-300", button: "bg-emerald-600 text-white hover:bg-emerald-700" },
                    };
                    const colors = colorMap[plan.color];

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden border-2 bg-white shadow-sm transition-all hover:shadow-lg ${plan.popular ? colors.border : "border-gray-200"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute right-0 top-0 rounded-bl-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                                    Most Popular
                                </div>
                            )}
                            <CardContent className="p-6">
                                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                                    <Icon className={`h-6 w-6 ${colors.text}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <p className="mb-4 text-sm text-gray-500">{plan.description}</p>
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                    <span className="text-sm text-gray-400">{plan.period}</span>
                                </div>

                                <Button
                                    className={`mb-6 w-full ${colors.button}`}
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={plan.id === "free" || isLoading}
                                >
                                    {isLoading ? "Redirecting..." : plan.cta}
                                    {plan.id !== "free" && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>

                                <div className="space-y-2">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            <span className="text-sm text-gray-600">{f}</span>
                                        </div>
                                    ))}
                                    {plan.limitations.map((l, i) => (
                                        <div key={`l-${i}`} className="flex items-start gap-2 opacity-50">
                                            <span className="mt-0.5 h-4 w-4 shrink-0 text-center text-xs text-gray-400">✕</span>
                                            <span className="text-sm text-gray-400">{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Feature Comparison Table */}
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    Compare Plans
                </h2>
                <Card className="overflow-hidden border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Feature</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">Free</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-amber-600">Plus</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-emerald-600">Pro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {featureComparison.map((row, i) => {
                                    const Icon = row.icon;
                                    return (
                                        <tr key={i} className="border-b border-gray-100 last:border-0">
                                            <td className="flex items-center gap-2 px-6 py-3 text-sm text-gray-700">
                                                <Icon className="h-4 w-4 text-gray-400" />
                                                {row.feature}
                                            </td>
                                            <td className="px-6 py-3 text-center text-sm text-gray-500">{row.free}</td>
                                            <td className="px-6 py-3 text-center text-sm font-medium text-gray-700">{row.plus}</td>
                                            <td className="px-6 py-3 text-center text-sm font-medium text-gray-700">{row.pro}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
