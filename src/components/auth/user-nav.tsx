"use client";

import { UserButton } from "@clerk/nextjs";

export function UserNav() {
    return (
        <UserButton
            appearance={{
                elements: {
                    avatarBox: "h-9 w-9",
                },
            }}
        />
    );
}
