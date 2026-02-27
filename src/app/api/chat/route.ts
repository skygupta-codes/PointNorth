import { NextResponse } from "next/server";

// POST /api/chat — Maple AI chat endpoint
// This will be fully implemented in Day 4 with Claude API integration.

export async function POST() {
    return NextResponse.json(
        {
            message:
                "Maple AI chat will be available soon! 🍁 Check back after Day 4.",
        },
        { status: 501 }
    );
}
