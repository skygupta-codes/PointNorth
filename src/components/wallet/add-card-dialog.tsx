"use client";

import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, CreditCard, Star } from "lucide-react";
import type { CreditCard as CreditCardType } from "@/types";

interface AddCardDialogProps {
    cards: CreditCardType[];
    onAdd: (data: {
        cardSlug: string;
        nickname: string;
        pointsBalance: number;
        isPrimary: boolean;
    }) => Promise<void>;
}

const networkColors: Record<string, string> = {
    visa: "bg-blue-600",
    mastercard: "bg-orange-600",
    amex: "bg-sky-600",
};

export function AddCardDialog({ cards, onAdd }: AddCardDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"select" | "details">("select");
    const [search, setSearch] = useState("");
    const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(
        null
    );
    const [nickname, setNickname] = useState("");
    const [pointsBalance, setPointsBalance] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);
    const [loading, setLoading] = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return cards;
        return cards.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.issuer.toLowerCase().includes(q) ||
                c.network.includes(q)
        );
    }, [cards, search]);

    function reset() {
        setStep("select");
        setSearch("");
        setSelectedCard(null);
        setNickname("");
        setPointsBalance("");
        setIsPrimary(false);
        setLoading(false);
    }

    async function handleSubmit() {
        if (!selectedCard) return;
        setLoading(true);
        try {
            await onAdd({
                cardSlug: selectedCard.slug,
                nickname,
                pointsBalance: parseInt(pointsBalance) || 0,
                isPrimary,
            });
            setOpen(false);
            reset();
        } catch {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) reset();
            }}
        >
            <DialogTrigger asChild>
                <Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Card
                </Button>
            </DialogTrigger>
            <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {step === "select"
                            ? "Choose a Credit Card"
                            : selectedCard?.name}
                    </DialogTitle>
                </DialogHeader>

                {step === "select" && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search by name, issuer, or network..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-zinc-700 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                            {filtered.map((card) => (
                                <button
                                    key={card.slug}
                                    onClick={() => {
                                        setSelectedCard(card);
                                        setStep("details");
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-all hover:border-amber-500/50 hover:bg-zinc-900"
                                >
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${networkColors[card.network] || "bg-zinc-700"}`}
                                    >
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-white">
                                            {card.name}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {card.issuer} ·{" "}
                                            {card.annualFee === 0
                                                ? "No fee"
                                                : `$${card.annualFee}/yr`}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="shrink-0 bg-zinc-800 text-xs text-zinc-400"
                                    >
                                        {card.network.toUpperCase()}
                                    </Badge>
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <p className="py-8 text-center text-sm text-zinc-500">
                                    No cards found for &ldquo;{search}&rdquo;
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {step === "details" && selectedCard && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setStep("select")}
                            className="text-sm text-amber-400 hover:underline"
                        >
                            ← Choose a different card
                        </button>

                        {/* Card preview */}
                        <div
                            className={`rounded-xl p-4 ${networkColors[selectedCard.network] || "bg-zinc-700"}`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white/80">
                                    {selectedCard.issuer}
                                </p>
                                <Badge className="bg-white/20 text-xs text-white">
                                    {selectedCard.network.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="mt-2 text-lg font-bold text-white">
                                {selectedCard.name}
                            </p>
                            <p className="mt-1 text-sm text-white/60">
                                {selectedCard.rewardsCurrency} ·{" "}
                                {selectedCard.annualFee === 0
                                    ? "No annual fee"
                                    : `$${selectedCard.annualFee}/yr`}
                            </p>
                        </div>

                        {/* Top earn rates */}
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedCard.earnRates)
                                .filter(([, rate]) => rate > 1)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 4)
                                .map(([cat, rate]) => (
                                    <Badge
                                        key={cat}
                                        variant="secondary"
                                        className="bg-amber-500/10 text-amber-400"
                                    >
                                        {rate}x {cat}
                                    </Badge>
                                ))}
                        </div>

                        {/* Form fields */}
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm text-zinc-400">
                                    Nickname (optional)
                                </label>
                                <Input
                                    placeholder='e.g. "Daily Spender"'
                                    value={nickname}
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                    className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-zinc-400">
                                    Current points balance
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={pointsBalance}
                                    onChange={(e) =>
                                        setPointsBalance(e.target.value)
                                    }
                                    className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={isPrimary}
                                    onChange={(e) =>
                                        setIsPrimary(e.target.checked)
                                    }
                                    className="rounded border-zinc-600"
                                />
                                <Star className="h-4 w-4 text-amber-400" />
                                Set as primary card
                            </label>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
                        >
                            {loading ? "Adding..." : "Add to Wallet"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
