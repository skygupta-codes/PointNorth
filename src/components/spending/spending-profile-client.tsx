"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, DollarSign, Check } from "lucide-react";

const CATEGORIES = [
    { key: "groceries", label: "Groceries", emoji: "🛒", max: 2000, step: 50 },
    { key: "dining", label: "Dining & Food Delivery", emoji: "🍽️", max: 1500, step: 50 },
    { key: "gas", label: "Gas & EV Charging", emoji: "⛽", max: 1000, step: 25 },
    { key: "travel", label: "Travel & Hotels", emoji: "✈️", max: 3000, step: 100 },
    { key: "streaming", label: "Streaming & Subscriptions", emoji: "📺", max: 500, step: 10 },
    { key: "shopping", label: "Shopping & Retail", emoji: "🛍️", max: 2000, step: 50 },
    { key: "transit", label: "Transit & Rideshare", emoji: "🚇", max: 500, step: 25 },
    { key: "other", label: "Everything Else", emoji: "💳", max: 3000, step: 50 },
];

export function SpendingProfileClient() {
    const [spending, setSpending] = useState<Record<string, number>>({
        groceries: 0,
        dining: 0,
        gas: 0,
        travel: 0,
        streaming: 0,
        shopping: 0,
        transit: 0,
        other: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/spending-profile");
            const data = await res.json();
            if (data.profile) {
                setSpending({
                    groceries: Number(data.profile.groceries) || 0,
                    dining: Number(data.profile.dining) || 0,
                    gas: Number(data.profile.gas) || 0,
                    travel: Number(data.profile.travel) || 0,
                    streaming: Number(data.profile.streaming) || 0,
                    shopping: Number(data.profile.shopping) || 0,
                    transit: Number(data.profile.transit) || 0,
                    other: Number(data.profile.other) || 0,
                });
            }
        } catch (err) {
            console.error("Failed to load spending profile:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch("/api/spending-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(spending),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    }

    const totalMonthly = Object.values(spending).reduce((a, b) => a + b, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Spending Profile</h1>
                    <p className="mt-2 text-zinc-400">
                        Tell us how much you spend monthly in each category so we can
                        recommend the best cards.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
                >
                    {saved ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Saved!
                        </>
                    ) : saving ? (
                        "Saving..."
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Profile
                        </>
                    )}
                </Button>
            </div>

            {/* Monthly Total */}
            <Card className="mb-6 border-zinc-800 bg-zinc-900/50">
                <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                            <DollarSign className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Estimated Monthly Spending</p>
                            <p className="text-3xl font-bold text-white">
                                ${totalMonthly.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-400"
                    >
                        ${(totalMonthly * 12).toLocaleString()}/yr
                    </Badge>
                </CardContent>
            </Card>

            {/* Category Sliders */}
            <div className="grid gap-4 md:grid-cols-2">
                {CATEGORIES.map((cat) => (
                    <Card
                        key={cat.key}
                        className="border-zinc-800 bg-zinc-900/50"
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-zinc-300">
                                    <span className="text-lg">{cat.emoji}</span>
                                    {cat.label}
                                </span>
                                <span className="text-lg font-bold text-white">
                                    ${spending[cat.key].toLocaleString()}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <input
                                type="range"
                                min={0}
                                max={cat.max}
                                step={cat.step}
                                value={spending[cat.key]}
                                onChange={(e) =>
                                    setSpending((prev) => ({
                                        ...prev,
                                        [cat.key]: Number(e.target.value),
                                    }))
                                }
                                className="w-full accent-amber-500"
                            />
                            <div className="mt-1 flex justify-between text-xs text-zinc-600">
                                <span>$0</span>
                                <span>${cat.max.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom save button for mobile */}
            <div className="mt-6 flex justify-center md:hidden">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
                >
                    {saved ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Profile
                        </>
                    )}
                </Button>
            </div>
        </>
    );
}
