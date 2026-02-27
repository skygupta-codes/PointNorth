import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "@/db";
import { users, userCards, spendingProfiles, chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCardBySlug } from "@/lib/cards";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Build system context from user's wallet and spending profile
async function buildUserContext(clerkId: string): Promise<string> {
    const db = getDb();
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

    if (!user) return "User has not set up their profile yet.";

    // Wallet
    const cards = await db
        .select()
        .from(userCards)
        .where(eq(userCards.userId, user.id));

    let walletContext = "";
    if (cards.length > 0) {
        walletContext = "\n\nUSER'S WALLET:\n";
        for (const uc of cards) {
            const details = getCardBySlug(uc.cardSlug);
            if (details) {
                const rates = Object.entries(details.earnRates)
                    .map(([cat, rate]) => `${cat}: ${rate}x`)
                    .join(", ");
                walletContext += `- ${details.name} (${details.issuer}, ${details.network.toUpperCase()}) — ${(uc.pointsBalance ?? 0).toLocaleString()} ${details.rewardsCurrency} — Earn rates: ${rates} — Fee: $${details.annualFee}/yr${uc.isPrimary ? " [PRIMARY]" : ""}\n`;
            }
        }
    } else {
        walletContext = "\n\nUSER'S WALLET: Empty (no cards added yet)";
    }

    // Spending
    const [profile] = await db
        .select()
        .from(spendingProfiles)
        .where(eq(spendingProfiles.userId, user.id))
        .limit(1);

    let spendingContext = "";
    if (profile) {
        spendingContext = `\n\nUSER'S MONTHLY SPENDING:
- Groceries: $${profile.groceries}/mo
- Dining: $${profile.dining}/mo
- Gas: $${profile.gas}/mo
- Travel: $${profile.travel}/mo
- Streaming: $${profile.streaming}/mo
- Shopping: $${profile.shopping}/mo
- Transit: $${profile.transit}/mo
- Other: $${profile.other}/mo`;
    } else {
        spendingContext = "\n\nUSER'S SPENDING PROFILE: Not set up yet.";
    }

    return `User: ${user.name || user.email}${walletContext}${spendingContext}`;
}

const SYSTEM_PROMPT = `You are Maple 🍁, the friendly and knowledgeable AI rewards advisor for TrueNorthPoints.ca — a Canadian credit card rewards optimizer.

YOUR EXPERTISE:
- Canadian credit card rewards programs (Aeroplan, Scene+, PC Optimum, Air Miles, cashback, etc.)
- Earn rates and category multipliers for Canadian credit cards
- Best card to use for different spending categories
- Points transfer partners and redemption strategies
- Annual fee analysis and whether a card is worth keeping
- Canadian-specific tips (e.g. which grocery stores code as grocery, gas station hacks, etc.)

PERSONALITY:
- Warm, friendly, and encouraging — like a smart friend who's great with credit cards
- Use occasional Canadian references naturally (but don't overdo it)
- Give specific, actionable advice based on the user's actual cards and spending
- When recommending which card to use, always explain WHY (the earn rate, the math)
- Keep responses concise but thorough — aim for 2-4 short paragraphs max
- Use bullet points for comparisons and lists
- If the user doesn't have a card in their wallet, mention it could be worth adding

RULES:
- ALWAYS reference the user's actual wallet and spending data when answering
- If the user asks about a card they don't have, compare it to what they DO have
- Round dollar amounts to whole numbers
- Never recommend anything unethical or against card terms of service
- If you don't know something specific, say so honestly
- Respond in the same language the user writes in (English or French)`;

// POST /api/chat — Maple AI chat
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { message, history = [] } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Build user context
        const userContext = await buildUserContext(clerkId);

        // Build Gemini chat history
        const geminiHistory = history.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        // Create Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `${SYSTEM_PROMPT}\n\n--- USER DATA ---\n${userContext}`,
        });

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(message);
        const response = result.response.text();

        // Save to database
        const db = getDb();
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (user) {
            // Save user message
            await db.insert(chatMessages).values({
                userId: user.id,
                role: "user",
                content: message,
            });
            // Save assistant response
            await db.insert(chatMessages).values({
                userId: user.id,
                role: "assistant",
                content: response,
            });
        }

        return NextResponse.json({ reply: response });
    } catch (err) {
        console.error("POST /api/chat error:", err);
        return NextResponse.json(
            { error: "Failed to get AI response" },
            { status: 500 }
        );
    }
}

// GET /api/chat — fetch chat history
export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDb();
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (!user) {
            return NextResponse.json({ messages: [] });
        }

        const messages = await db
            .select({
                role: chatMessages.role,
                content: chatMessages.content,
                createdAt: chatMessages.createdAt,
            })
            .from(chatMessages)
            .where(eq(chatMessages.userId, user.id))
            .orderBy(chatMessages.createdAt)
            .limit(50);

        return NextResponse.json({ messages });
    } catch (err) {
        console.error("GET /api/chat error:", err);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
