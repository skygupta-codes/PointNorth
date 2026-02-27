"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, Pencil, Check, X, TrendingUp } from "lucide-react";
import type { CreditCard as CreditCardType } from "@/types";

interface UserCard {
    id: string;
    cardSlug: string;
    nickname: string | null;
    pointsBalance: number | null;
    isPrimary: boolean | null;
}

const networkGradients: Record<string, string> = {
    visa: "from-blue-500 to-blue-700",
    mastercard: "from-orange-500 to-red-600",
    amex: "from-sky-500 to-blue-600",
};

export function WalletCard({
    userCard,
    cardDetails,
    onUpdate,
    onDelete,
}: {
    userCard: UserCard;
    cardDetails: CreditCardType | null;
    onUpdate: (id: string, data: Partial<UserCard>) => void;
    onDelete: (id: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [nickname, setNickname] = useState(userCard.nickname || "");
    const [points, setPoints] = useState(String(userCard.pointsBalance || 0));

    const network = cardDetails?.network || "visa";
    const gradient = networkGradients[network] || networkGradients.visa;

    function handleSave() {
        onUpdate(userCard.id, {
            nickname: nickname || null,
            pointsBalance: Number(points) || 0,
        });
        setEditing(false);
    }

    // Top 3 earn rates
    const topRates = cardDetails
        ? Object.entries(cardDetails.earnRates)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
        : [];

    return (
        <Card className="overflow-hidden border-gray-200 bg-white shadow-sm">
            {/* Gradient Header */}
            <div
                className={`bg-gradient-to-r ${gradient} p-4 text-white`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-white/80">
                            {cardDetails?.issuer}
                        </p>
                        <p className="text-sm font-bold">
                            {userCard.nickname || cardDetails?.name || userCard.cardSlug}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        {userCard.isPrimary && (
                            <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                        )}
                        <Badge className="bg-white/20 text-white text-xs">
                            {network.toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </div>

            <CardContent className="p-4">
                {editing ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500">Nickname</label>
                            <Input
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Card nickname"
                                className="mt-1 border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Points Balance</label>
                            <Input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                className="mt-1 border-gray-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                className="bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                                <Check className="mr-1 h-3 w-3" />
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditing(false)}
                                className="border-gray-200"
                            >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Points Balance */}
                        <div className="mb-3 flex items-baseline justify-between">
                            <div>
                                <p className="text-xs text-gray-400">Points Balance</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(userCard.pointsBalance ?? 0).toLocaleString()}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {cardDetails?.rewardsCurrency || "points"}
                            </span>
                        </div>

                        {/* Top Earn Rates */}
                        {topRates.length > 0 && (
                            <div className="mb-3 space-y-1">
                                {topRates.map(([cat, rate]) => (
                                    <div
                                        key={cat}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <span className="capitalize text-gray-500">{cat}</span>
                                        <span className="flex items-center gap-1 font-medium text-gray-700">
                                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                                            {rate}x
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditing(true)}
                                className="flex-1 border-gray-200 text-gray-600 hover:text-gray-900"
                            >
                                <Pencil className="mr-1 h-3 w-3" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDelete(userCard.id)}
                                className="border-gray-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
