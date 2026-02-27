"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    CreditCard,
    Star,
    Trash2,
    Pencil,
    Check,
    X,
    TrendingUp,
} from "lucide-react";
import type { CreditCard as CreditCardType, UserCard } from "@/types";

interface WalletCardProps {
    userCard: UserCard;
    cardDetails: CreditCardType | undefined;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (
        id: string,
        data: { nickname?: string; pointsBalance?: number; isPrimary?: boolean }
    ) => Promise<void>;
}

const networkColors: Record<string, string> = {
    visa: "from-blue-600 to-blue-800",
    mastercard: "from-orange-600 to-red-700",
    amex: "from-sky-600 to-indigo-700",
};

const networkBorders: Record<string, string> = {
    visa: "border-blue-500/30",
    mastercard: "border-orange-500/30",
    amex: "border-sky-500/30",
};

export function WalletCard({
    userCard,
    cardDetails,
    onDelete,
    onUpdate,
}: WalletCardProps) {
    const [editing, setEditing] = useState(false);
    const [editNickname, setEditNickname] = useState(
        userCard.nickname || ""
    );
    const [editPoints, setEditPoints] = useState(
        String(userCard.pointsBalance)
    );
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);

    if (!cardDetails) {
        return (
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-6">
                    <p className="text-sm text-zinc-500">
                        Unknown card: {userCard.cardSlug}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const network = cardDetails.network;
    const topRates = Object.entries(cardDetails.earnRates)
        .filter(([, rate]) => rate > 1)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    async function handleSave() {
        setSaving(true);
        await onUpdate(userCard.id, {
            nickname: editNickname || undefined,
            pointsBalance: parseInt(editPoints) || 0,
        });
        setEditing(false);
        setSaving(false);
    }

    async function handleDelete() {
        setDeleting(true);
        await onDelete(userCard.id);
    }

    async function togglePrimary() {
        await onUpdate(userCard.id, { isPrimary: !userCard.isPrimary });
    }

    return (
        <Card
            className={`overflow-hidden border ${networkBorders[network] || "border-zinc-800"} bg-zinc-900/50`}
        >
            {/* Card gradient header */}
            <div
                className={`bg-gradient-to-r ${networkColors[network] || "from-zinc-700 to-zinc-800"} p-4`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-white/80" />
                        <span className="text-sm font-medium text-white/80">
                            {cardDetails.issuer}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {userCard.isPrimary && (
                            <Badge className="bg-amber-500/90 text-xs text-zinc-950">
                                <Star className="mr-1 h-3 w-3" />
                                Primary
                            </Badge>
                        )}
                        <Badge className="bg-white/20 text-xs text-white">
                            {network.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                <h3 className="mt-2 text-lg font-bold text-white">
                    {userCard.nickname || cardDetails.name}
                </h3>
                {userCard.nickname && (
                    <p className="text-sm text-white/60">{cardDetails.name}</p>
                )}
            </div>

            <CardContent className="p-4">
                {editing ? (
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs text-zinc-400">
                                Nickname
                            </label>
                            <Input
                                value={editNickname}
                                onChange={(e) =>
                                    setEditNickname(e.target.value)
                                }
                                placeholder={cardDetails.name}
                                className="border-zinc-700 bg-zinc-900 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-zinc-400">
                                Points Balance
                            </label>
                            <Input
                                type="number"
                                value={editPoints}
                                onChange={(e) => setEditPoints(e.target.value)}
                                className="border-zinc-700 bg-zinc-900 text-sm text-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                                <Check className="mr-1 h-3 w-3" />
                                {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditing(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Points balance */}
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-zinc-500">
                                    Points Balance
                                </p>
                                <p className="text-2xl font-bold text-white">
                                    {userCard.pointsBalance.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500">
                                    {cardDetails.rewardsCurrency}
                                </p>
                                <p className="text-sm text-zinc-400">
                                    {cardDetails.annualFee === 0
                                        ? "No fee"
                                        : `$${cardDetails.annualFee}/yr`}
                                </p>
                            </div>
                        </div>

                        {/* Top earn rates */}
                        {topRates.length > 0 && (
                            <div className="mb-3">
                                <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
                                    <TrendingUp className="h-3 w-3" />
                                    Top Earn Rates
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {topRates.map(([cat, rate]) => (
                                        <Badge
                                            key={cat}
                                            variant="secondary"
                                            className="bg-amber-500/10 text-xs text-amber-400"
                                        >
                                            {rate}x {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 border-t border-zinc-800 pt-3">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditing(true)}
                                className="text-xs text-zinc-400 hover:text-white"
                            >
                                <Pencil className="mr-1 h-3 w-3" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={togglePrimary}
                                className={`text-xs ${userCard.isPrimary ? "text-amber-400" : "text-zinc-400 hover:text-amber-400"}`}
                            >
                                <Star className="mr-1 h-3 w-3" />
                                {userCard.isPrimary ? "Primary" : "Set Primary"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="ml-auto text-xs text-zinc-500 hover:text-rose-400"
                            >
                                <Trash2 className="mr-1 h-3 w-3" />
                                {deleting ? "Removing..." : "Remove"}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
