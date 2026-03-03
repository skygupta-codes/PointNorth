"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface UpgradeBannerProps {
    feature: string;
    description: string;
    requiredTier?: "plus" | "pro";
}

export function UpgradeBanner({
    feature,
    description,
    requiredTier = "plus",
}: UpgradeBannerProps) {
    return (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
            <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            {feature} — Upgrade to {requiredTier === "pro" ? "Pro" : "Plus"}
                        </p>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>
                <Link href="/upgrade" className="shrink-0">
                    <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
                        Upgrade Now
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
