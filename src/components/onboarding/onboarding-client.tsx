"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    DollarSign,
    Sparkles,
    ArrowRight,
    Check,
    ChevronRight,
} from "lucide-react";

const steps = [
    { id: 1, title: "Add your credit cards", description: "Tell us which cards are in your wallet", icon: CreditCard, href: "/wallet", color: "amber" },
    { id: 2, title: "Set up spending profile", description: "Share your monthly spending by category", icon: DollarSign, href: "/spending", color: "emerald" },
    { id: 3, title: "Get recommendations", description: "See which card to use for every purchase", icon: Sparkles, href: "/recommendations", color: "sky" },
];

export function OnboardingClient({ hasCards, hasSpending }: { hasCards: boolean; hasSpending: boolean }) {
    const router = useRouter();
    const [completing, setCompleting] = useState(false);

    const completedSteps = [hasCards, hasSpending, hasCards && hasSpending];
    const currentStep = completedSteps.filter(Boolean).length;

    async function handleComplete() {
        setCompleting(true);
        try {
            await fetch("/api/onboarding/complete", { method: "POST" });
            router.push("/dashboard");
        } catch {
            setCompleting(false);
        }
    }

    return (
        <div className="flex flex-col items-center py-8">
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-emerald-100">
                    <span className="text-4xl">🍁</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome to TrueNorthPoints!</h1>
                <p className="mt-2 max-w-md text-gray-500">
                    Let&apos;s get you set up in 3 easy steps so you can start maximizing your Canadian credit card rewards.
                </p>
            </div>

            {/* Progress */}
            <div className="mb-8 flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                    <div key={i} className={`h-2 w-16 rounded-full transition-colors ${completedSteps[i] ? "bg-amber-500" : "bg-gray-200"}`} />
                ))}
                <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-500">{currentStep}/3</Badge>
            </div>

            {/* Steps */}
            <div className="w-full max-w-lg space-y-3">
                {steps.map((step, i) => {
                    const done = completedSteps[i];
                    const Icon = step.icon;
                    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                        amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
                        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
                        sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
                    };
                    const colors = colorMap[step.color];

                    return (
                        <Link key={step.id} href={step.href}>
                            <Card className={`cursor-pointer border-gray-200 bg-white shadow-sm transition-all hover:shadow-md ${done ? colors.border : ""}`}>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${done ? "bg-emerald-50" : colors.bg}`}>
                                        {done ? (<Check className="h-5 w-5 text-emerald-500" />) : (<Icon className={`h-5 w-5 ${colors.text}`} />)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${done ? "text-gray-400 line-through" : "text-gray-900"}`}>{step.title}</p>
                                        <p className="text-xs text-gray-400">{step.description}</p>
                                    </div>
                                    {done ? (<Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Done</Badge>) : (<ChevronRight className="h-5 w-5 text-gray-300" />)}
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 flex items-center gap-4">
                {currentStep >= 2 ? (
                    <Button onClick={handleComplete} disabled={completing} className="bg-amber-500 text-white hover:bg-amber-600">
                        {completing ? "Setting up..." : "Go to Dashboard"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="ghost" onClick={handleComplete} disabled={completing} className="text-gray-400 hover:text-gray-600">
                        Skip for now
                    </Button>
                )}
            </div>
        </div>
    );
}
