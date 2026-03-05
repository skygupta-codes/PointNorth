"use client";

import { Badge } from "@/components/ui/badge";
import type { ValueTier } from "@/lib/travel/calculations";

// ─── Types ─────────────────────────────────────────────

interface ValueBadgeProps {
    tier: ValueTier;
    cpm: number;
}

// ─── Tier Config ───────────────────────────────────────

const TIER_STYLES: Record<
    ValueTier,
    { label: string; bg: string; text: string; emoji: string }
> = {
    exceptional: { label: "Exceptional", bg: "bg-green-100", text: "text-green-700", emoji: "🟢" },
    great: { label: "Great", bg: "bg-lime-100", text: "text-lime-700", emoji: "🟡" },
    good: { label: "Good", bg: "bg-amber-100", text: "text-amber-700", emoji: "🟠" },
    poor: { label: "Poor", bg: "bg-red-100", text: "text-red-700", emoji: "🔴" },
    terrible: { label: "Terrible", bg: "bg-red-200", text: "text-red-900", emoji: "⛔" },
};

// ─── Component ─────────────────────────────────────────

export default function ValueBadge({ tier, cpm }: ValueBadgeProps) {
    const style = TIER_STYLES[tier];

    return (
        <Badge className={`${style.bg} ${style.text} text-[11px] gap-1`}>
            {style.emoji} {cpm}¢/mile · {style.label}
        </Badge>
    );
}
