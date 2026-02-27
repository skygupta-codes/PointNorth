"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import type { CreditCard as CreditCardType } from "@/types";
import { WalletCard } from "./wallet-card";
import { AddCardDialog } from "./add-card-dialog";

interface UserCardFromAPI {
    id: string;
    cardSlug: string;
    nickname: string | null;
    pointsBalance: number | null;
    isPrimary: boolean | null;
}

export function WalletClient({
    cardCatalog,
}: {
    cardCatalog: CreditCardType[];
}) {
    const [cards, setCards] = useState<UserCardFromAPI[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = useCallback(async () => {
        try {
            const res = await fetch("/api/cards");
            const data = await res.json();
            setCards(data.cards || []);
        } catch (err) {
            console.error("Failed to fetch cards:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    async function handleAdd(card: {
        cardSlug: string;
        nickname: string;
        pointsBalance: number;
        isPrimary: boolean;
    }) {
        try {
            const res = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(card),
            });
            if (res.ok) fetchCards();
        } catch (err) {
            console.error("Failed to add card:", err);
        }
    }

    async function handleUpdate(
        id: string,
        data: Partial<UserCardFromAPI>
    ) {
        try {
            const res = await fetch("/api/cards", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...data }),
            });
            if (res.ok) fetchCards();
        } catch (err) {
            console.error("Failed to update card:", err);
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/cards?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchCards();
        } catch (err) {
            console.error("Failed to delete card:", err);
        }
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                    <p className="mt-2 text-gray-500">
                        {cards.length > 0
                            ? `${cards.length} card${cards.length !== 1 ? "s" : ""} in your wallet`
                            : "Add your Canadian credit cards to get started"}
                    </p>
                </div>
                <AddCardDialog cardCatalog={cardCatalog} onAdd={handleAdd} />
            </div>

            {cards.length === 0 ? (
                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            No cards in your wallet yet
                        </h3>
                        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
                            Add your Canadian credit cards to start tracking points and get
                            personalized recommendations.
                        </p>
                        <AddCardDialog cardCatalog={cardCatalog} onAdd={handleAdd} />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <WalletCard
                            key={card.id}
                            userCard={card}
                            cardDetails={
                                cardCatalog.find(
                                    (c) => c.slug === card.cardSlug
                                ) || null
                            }
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
