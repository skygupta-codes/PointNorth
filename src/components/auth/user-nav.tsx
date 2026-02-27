"use client";

import dynamic from "next/dynamic";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkKey && !clerkKey.includes("REPLACE_ME");

const ClerkUserButton = dynamic(
    () => import("@clerk/nextjs").then((mod) => mod.UserButton),
    { ssr: false }
);

export function UserNav() {
    if (!isClerkConfigured) {
        return (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm text-zinc-400">
                ?
            </div>
        );
    }

    return (
        <ClerkUserButton
            appearance={{
                elements: {
                    avatarBox: "h-9 w-9",
                },
            }}
        />
    );
}
