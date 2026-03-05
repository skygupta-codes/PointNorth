"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    AlertTriangle,
    Coins,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
    LOYALTY_PROGRAMS,
    getLoyaltyProgram,
    formatPointsValue,
} from "@/lib/loyalty-programs";
import type { LoyaltyProgram } from "@/lib/loyalty-programs";

interface LoyaltyAccount {
    id: string;
    program: string;
    accountNumber: string | null;
    currentBalance: number;
    statusTier: string | null;
    pointsExpiryDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function LoyaltyPage() {
    const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBalance, setEditBalance] = useState("");

    // Add form state
    const [selectedProgram, setSelectedProgram] = useState("");
    const [newBalance, setNewBalance] = useState("");
    const [newTier, setNewTier] = useState("");
    const [newExpiry, setNewExpiry] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchAccounts = useCallback(async () => {
        try {
            const res = await fetch("/api/loyalty-accounts");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setAccounts(data.accounts || []);
        } catch (err) {
            console.error("Failed to fetch loyalty accounts:", err);
            toast.error("Failed to load loyalty accounts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    async function handleAdd() {
        if (!selectedProgram) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/loyalty-accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    program: selectedProgram,
                    currentBalance: parseInt(newBalance) || 0,
                    statusTier: newTier || null,
                    pointsExpiryDate: newExpiry || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to add account");
            }
            toast.success("Loyalty account added!");
            setDialogOpen(false);
            setSelectedProgram("");
            setNewBalance("");
            setNewTier("");
            setNewExpiry("");
            fetchAccounts();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/loyalty-accounts?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Account removed");
            setAccounts((prev) => prev.filter((a) => a.id !== id));
        } catch {
            toast.error("Failed to remove account");
        }
    }

    async function handleUpdateBalance(id: string) {
        try {
            const res = await fetch("/api/loyalty-accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    currentBalance: parseInt(editBalance) || 0,
                }),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("Balance updated");
            setEditingId(null);
            fetchAccounts();
        } catch {
            toast.error("Failed to update balance");
        }
    }

    // Calculate total portfolio value
    const totalValue = accounts.reduce((sum, acc) => {
        const prog = getLoyaltyProgram(acc.program);
        if (!prog) return sum;
        return sum + (acc.currentBalance * prog.valueCentsPerPoint) / 100;
    }, 0);

    const selectedProgramData: LoyaltyProgram | undefined = selectedProgram
        ? getLoyaltyProgram(selectedProgram)
        : undefined;

    const existingPrograms = new Set(accounts.map((a) => a.program));

    if (loading) {
        return (
            <div className="py-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">Loyalty Accounts</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-gray-200 bg-white shadow-sm">
                            <CardContent className="p-6">
                                <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
                                <div className="mt-4 h-5 w-32 animate-pulse rounded bg-gray-100" />
                                <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-100" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Loyalty Accounts</h1>
                    <p className="mt-1 text-gray-500">
                        Track your rewards programs in one place
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-500 text-white active:bg-amber-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Program
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader>
                            <DialogTitle>Add Loyalty Program</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Program
                                </label>
                                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LOYALTY_PROGRAMS.filter(
                                            (p) => !existingPrograms.has(p.slug)
                                        ).map((p) => (
                                            <SelectItem key={p.slug} value={p.slug}>
                                                {p.icon} {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Current Balance ({selectedProgramData?.currency || "Points"})
                                </label>
                                <Input
                                    type="number"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            {selectedProgramData?.hasStatusTiers && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Status Tier
                                    </label>
                                    <Select value={newTier} onValueChange={setNewTier}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select tier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedProgramData.statusTiers?.map((tier) => (
                                                <SelectItem key={tier} value={tier}>
                                                    {tier}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {selectedProgramData?.pointsExpire && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Points Expiry Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={newExpiry}
                                        onChange={(e) => setNewExpiry(e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        {selectedProgramData.expiryNote}
                                    </p>
                                </div>
                            )}

                            <Button
                                className="w-full bg-amber-500 text-white active:bg-amber-600"
                                onClick={handleAdd}
                                disabled={!selectedProgram || submitting}
                            >
                                {submitting ? "Adding..." : "Add Account"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Portfolio Summary */}
            {accounts.length > 0 && (
                <Card className="mb-8 border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <TrendingUp className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-amber-800">
                                Total Portfolio Value
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                ~${totalValue.toFixed(0)} CAD
                            </p>
                            <p className="text-xs text-gray-500">
                                Across {accounts.length} program{accounts.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Expiry Warnings */}
            {accounts
                .filter((a) => {
                    if (!a.pointsExpiryDate) return false;
                    const expiry = new Date(a.pointsExpiryDate);
                    const daysUntil = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                    return daysUntil >= 0 && daysUntil <= 90;
                })
                .map((a) => {
                    const prog = getLoyaltyProgram(a.program);
                    const expiry = new Date(a.pointsExpiryDate!);
                    const daysUntil = Math.ceil(
                        (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                        <Card
                            key={`warn-${a.id}`}
                            className="mb-4 border-orange-200 bg-orange-50 shadow-sm"
                        >
                            <CardContent className="flex items-center gap-3 p-4">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500" />
                                <p className="text-sm text-orange-800">
                                    <strong>{prog?.name || a.program}</strong> {prog?.currency || "points"} expire in{" "}
                                    <strong>{daysUntil} day{daysUntil !== 1 ? "s" : ""}</strong>{" "}
                                    ({expiry.toLocaleDateString("en-CA")})
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}

            {/* Account Cards */}
            {accounts.length === 0 ? (
                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                            <Coins className="h-8 w-8 text-amber-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            No Loyalty Accounts Yet
                        </h3>
                        <p className="mb-6 max-w-sm text-sm text-gray-500">
                            Add your Aeroplan, Air Miles, Scene+, PC Optimum and other
                            loyalty program accounts to track your total rewards portfolio.
                        </p>
                        <Button
                            className="bg-amber-500 text-white active:bg-amber-600"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Program
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => {
                        const prog = getLoyaltyProgram(account.program);
                        if (!prog) return null;
                        const isEditing = editingId === account.id;

                        return (
                            <Card
                                key={account.id}
                                className="border-gray-200 bg-white shadow-sm transition-shadow active:shadow-md"
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${prog.bgColor}`}
                                            >
                                                <span className="text-lg">{prog.icon}</span>
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold text-gray-900">
                                                    {prog.name}
                                                </CardTitle>
                                                {account.statusTier && (
                                                    <Badge
                                                        variant="secondary"
                                                        className={`mt-0.5 text-xs ${prog.bgColor} ${prog.color}`}
                                                    >
                                                        {account.statusTier}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 active:text-red-500"
                                            onClick={() => handleDelete(account.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={editBalance}
                                                        onChange={(e) =>
                                                            setEditBalance(e.target.value)
                                                        }
                                                        className="h-8 w-28 text-sm"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="icon"
                                                        className="h-8 w-8 bg-emerald-500 active:bg-emerald-600"
                                                        onClick={() =>
                                                            handleUpdateBalance(account.id)
                                                        }
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="group flex cursor-pointer items-center gap-2"
                                                    onClick={() => {
                                                        setEditingId(account.id);
                                                        setEditBalance(
                                                            String(account.currentBalance || 0)
                                                        );
                                                    }}
                                                >
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {(
                                                            account.currentBalance || 0
                                                        ).toLocaleString()}
                                                    </p>
                                                    <span className="text-xs text-gray-400">
                                                        {prog.currency}
                                                    </span>
                                                    <Edit2 className="h-3 w-3 text-gray-300 opacity-0 group-active:opacity-100" />
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-400">
                                                {formatPointsValue(
                                                    account.currentBalance || 0,
                                                    prog
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {account.pointsExpiryDate && (
                                        <div className="mt-3 rounded-md bg-gray-50 px-3 py-2">
                                            <p className="text-xs text-gray-500">
                                                Expires:{" "}
                                                {new Date(
                                                    account.pointsExpiryDate
                                                ).toLocaleDateString("en-CA")}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
