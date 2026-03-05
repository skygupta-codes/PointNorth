"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { BottomNav } from "@/components/navigation/bottom-nav";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/wallet", label: "My Wallet" },
    { href: "/loyalty", label: "Loyalty" },
    { href: "/aeroplan", label: "Aeroplan" },
    { href: "/travel", label: "Travel ✈️" },
    { href: "/spending", label: "Spending" },
    { href: "/recommendations", label: "Picks" },
    { href: "/chat", label: "Chat with Maple" },
    { href: "/billing", label: "Billing" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <span className="text-2xl">🍁</span>
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            TrueNorthPoints
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-6 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition active:text-amber-600 ${pathname === link.href
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 active:text-gray-900"
                        >
                            <Bell className="h-5 w-5" />
                        </Button>
                        <UserNav />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8 pb-[80px] md:pb-8">{children}</main>

            <BottomNav />
        </div>
    );
}
