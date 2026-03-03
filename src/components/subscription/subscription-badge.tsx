"use client";

import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, Crown } from "lucide-react";

const tierConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    free: { label: "Free", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200", icon: CreditCard },
    plus: { label: "Plus", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Sparkles },
    pro: { label: "Pro", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: Crown },
};

export function SubscriptionBadge({ tier }: { tier: string }) {
    const config = tierConfig[tier] || tierConfig.free;
    const Icon = config.icon;

    if (tier === "free") return null; // Don't show badge for free tier

    return (
        <Badge className={`${config.bg} ${config.color} border ${config.border} text-xs font-medium`}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    );
}
