"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, CreditCard } from "lucide-react";
import type { CreditCard as CreditCardType } from "@/types";

const networkColors: Record<string, string> = {
    visa: "bg-blue-100 text-blue-700",
    mastercard: "bg-orange-100 text-orange-700",
    amex: "bg-sky-100 text-sky-700",
};

export function AddCardDialog({
    cardCatalog,
    onAdd,
}: {
    cardCatalog: CreditCardType[];
    onAdd: (card: {
        cardSlug: string;
        nickname: string;
        pointsBalance: number;
        isPrimary: boolean;
    }) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<CreditCardType | null>(null);
    const [nickname, setNickname] = useState("");
    const [points, setPoints] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);

    const filtered = cardCatalog.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.issuer.toLowerCase().includes(search.toLowerCase())
    );

    function handleAdd() {
        if (!selected) return;
        onAdd({
            cardSlug: selected.slug,
            nickname,
            pointsBalance: Number(points) || 0,
            isPrimary,
        });
        setOpen(false);
        setSelected(null);
        setNickname("");
        setPoints("");
        setIsPrimary(false);
        setSearch("");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-amber-500 text-white hover:bg-amber-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add a Card
                </Button>
            </DialogTrigger>
            <DialogContent className="border-gray-200 bg-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">
                        {selected ? "Card Details" : "Choose a Card"}
                    </DialogTitle>
                </DialogHeader>

                {!selected ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by card name or issuer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 border-gray-200"
                            />
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto">
                            {filtered.map((card) => (
                                <button
                                    key={card.slug}
                                    onClick={() => setSelected(card)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:border-amber-300 hover:bg-amber-50"
                                >
                                    <CreditCard className="h-5 w-5 text-gray-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {card.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {card.issuer} ·{" "}
                                            {card.annualFee === 0
                                                ? "No annual fee"
                                                : `$${card.annualFee}/yr`}
                                        </p>
                                    </div>
                                    <Badge
                                        className={`shrink-0 ${networkColors[card.network] || "bg-gray-100 text-gray-600"}`}
                                    >
                                        {card.network.toUpperCase()}
                                    </Badge>
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <p className="py-8 text-center text-sm text-gray-400">
                                    No cards found
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Selected card preview */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        {selected.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selected.issuer} ·{" "}
                                        {selected.annualFee === 0
                                            ? "No annual fee"
                                            : `$${selected.annualFee}/yr`}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelected(null)}
                                    className="border-gray-200 text-gray-500"
                                >
                                    Change
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Nickname (optional)
                            </label>
                            <Input
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g. My Daily Driver"
                                className="mt-1 border-gray-200"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Current Points Balance
                            </label>
                            <Input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                placeholder="0"
                                className="mt-1 border-gray-200"
                            />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPrimary}
                                onChange={(e) => setIsPrimary(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                            />
                            <span className="text-sm text-gray-600">
                                Set as primary card
                            </span>
                        </label>

                        <Button
                            onClick={handleAdd}
                            className="w-full bg-amber-500 text-white hover:bg-amber-600"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add to Wallet
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
