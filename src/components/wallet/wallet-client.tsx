"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { AddCardDialog } from "@/components/wallet/add-card-dialog";
import { WalletCard } from "@/components/wallet/wallet-card";
import type { CreditCard as CreditCardType, UserCard } from "@/types";

interface WalletClientProps {
    cardCatalog: CreditCardType[];
}

export function WalletClient({ cardCatalog }: WalletClientProps) {
    const [userCards, setUserCards] = useState<UserCard[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = useCallback(async () => {
        try {
            const res = await fetch("/api/cards");
            const data = await res.json();
            setUserCards(data.cards || []);
        } catch (err) {
            console.error("Failed to fetch cards:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    async function handleAdd(data: {
        cardSlug: string;
        nickname: string;
        pointsBalance: number;
        isPrimary: boolean;
    }) {
        const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to add card");
        }
        await fetchCards();
    }

    async function handleDelete(id: string) {
        await fetch(`/api/cards?id=${id}`, { method: "DELETE" });
        await fetchCards();
    }

    async function handleUpdate(
        id: string,
        data: { nickname?: string; pointsBalance?: number; isPrimary?: boolean }
    ) {
        await fetch("/api/cards", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data }),
        });
        await fetchCards();
    }

    const getCardDetails = (slug: string) =>
        cardCatalog.find((c) => c.slug === slug);

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
                    <h1 className="text-3xl font-bold">My Wallet</h1>
                    <p className="mt-2 text-zinc-400">
                        {userCards.length === 0
                            ? "Add your credit cards to start tracking rewards."
                            : `${userCards.length} card${userCards.length !== 1 ? "s" : ""} in your wallet`}
                    </p>
                </div>
                <AddCardDialog cards={cardCatalog} onAdd={handleAdd} />
            </div>

            {userCards.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                            <CreditCard className="h-8 w-8 text-zinc-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">
                            No cards in your wallet yet
                        </h3>
                        <p className="mb-6 max-w-sm text-center text-sm text-zinc-400">
                            Start by adding your Canadian credit cards. We&apos;ll help you
                            track points and find the best card for every purchase.
                        </p>
                        <AddCardDialog cards={cardCatalog} onAdd={handleAdd} />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {userCards.map((uc) => (
                        <WalletCard
                            key={uc.id}
                            userCard={uc}
                            cardDetails={getCardDetails(uc.cardSlug)}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
