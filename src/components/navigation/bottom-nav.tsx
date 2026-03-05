"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plane, Star, CreditCard, MessageCircle } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/travel", label: "Travel", icon: Plane },
    { href: "/aeroplan", label: "Aeroplan", icon: Star },
    { href: "/wallet", label: "Points", icon: CreditCard },
    { href: "/chat", label: "Maple", icon: MessageCircle },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden bottom-nav"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4px)' }}
        >
            <div className="flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center min-h-[60px] px-3 active:opacity-70 ${isActive ? "text-amber-500" : "text-gray-400"
                                }`}
                        >
                            <Icon size={22} className="mb-1" />
                            <span className="text-[10px] font-medium leading-none">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
