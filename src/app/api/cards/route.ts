import { NextResponse } from "next/server";

// GET  /api/cards — Returns user's card wallet
// POST /api/cards — Adds a card to user's wallet
// These will be fully implemented in Day 3.

export async function GET() {
    return NextResponse.json({ cards: [] });
}

export async function POST() {
    return NextResponse.json(
        { message: "Card management will be available after Day 3." },
        { status: 501 }
    );
}
