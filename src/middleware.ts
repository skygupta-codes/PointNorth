import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecret = process.env.CLERK_SECRET_KEY;

    // Skip Clerk auth if not configured
    if (!clerkKey || !clerkSecret) {
        return NextResponse.next();
    }

    try {
        const { clerkMiddleware, createRouteMatcher } = await import(
            "@clerk/nextjs/server"
        );

        const isProtectedRoute = createRouteMatcher([
            "/dashboard(.*)",
            "/wallet(.*)",
            "/chat(.*)",
        ]);

        const handler = clerkMiddleware(async (auth, request) => {
            if (isProtectedRoute(request)) await auth.protect();
        });

        return handler(req, {} as never);
    } catch {
        return NextResponse.next();
    }
}

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
