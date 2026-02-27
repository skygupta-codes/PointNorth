"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, X } from "lucide-react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/wallet", label: "My Wallet" },
    { href: "/spending", label: "Spending" },
    { href: "/recommendations", label: "Picks" },
    { href: "/chat", label: "Chat with Maple" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
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
                                className={`text-sm font-medium transition hover:text-amber-600 ${pathname === link.href
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
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <Bell className="h-5 w-5" />
                        </Button>
                        <UserNav />

                        {/* Mobile menu trigger */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:text-gray-900 md:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-72 border-gray-200 bg-white p-0"
                            >
                                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🍁</span>
                                        <span className="font-bold text-gray-900">
                                            TrueNorthPoints
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setMobileOpen(false)}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <nav className="flex flex-col gap-1 p-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() =>
                                                setMobileOpen(false)
                                            }
                                            className={`rounded-lg px-4 py-3 text-sm font-medium transition ${pathname === link.href
                                                    ? "bg-amber-50 text-amber-700"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </div>
    );
}
