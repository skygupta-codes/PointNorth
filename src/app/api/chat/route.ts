import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getDb } from "@/db";
import { users, userCards, spendingProfiles, chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCardBySlug } from "@/lib/cards";
import { getUserTier, checkChatLimit } from "@/lib/subscription";

// Initialize AI clients
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

// Determine which provider to use: prefer OpenAI, fallback to Gemini
function getProvider(): "openai" | "gemini" {
    if (openai) return "openai";
    if (genAI) return "gemini";
    throw new Error("No AI provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY.");
}

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

// Chat with OpenAI (GPT-4o)
async function chatWithOpenAI(
    message: string,
    history: { role: string; content: string }[],
    userContext: string
): Promise<string> {
    if (!openai) throw new Error("OpenAI not configured");

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\n--- USER DATA ---\n${userContext}`,
        },
        ...history.map((msg) => ({
            role: (msg.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
            content: msg.content,
        })),
        { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1024,
        messages,
    });

    return response.choices[0]?.message?.content || "I couldn't generate a response.";
}

// Chat with Gemini (fallback)
async function chatWithGemini(
    message: string,
    history: { role: string; content: string }[],
    userContext: string
): Promise<string> {
    if (!genAI) throw new Error("Gemini not configured");

    const geminiHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }],
    }));

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `${SYSTEM_PROMPT}\n\n--- USER DATA ---\n${userContext}`,
    });

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    return result.response.text();
}

// POST /api/chat — Maple AI chat
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check subscription chat limit
        const { tier, userId: internalUserId } = await getUserTier(clerkId);
        if (internalUserId) {
            const chatLimit = await checkChatLimit(internalUserId, tier);
            if (!chatLimit.allowed) {
                return NextResponse.json(
                    {
                        error: "Daily chat limit reached",
                        limit: chatLimit.limit,
                        used: chatLimit.used,
                        upgrade: true,
                    },
                    { status: 429 }
                );
            }
        }

        const body = await req.json();
        const { message, history = [] } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Build user context
        const userContext = await buildUserContext(clerkId);

        // Get response from the configured AI provider
        // Try OpenAI first, fall back to Gemini if it fails
        let response: string;
        const provider = getProvider();

        try {
            if (provider === "openai") {
                response = await chatWithOpenAI(message, history, userContext);
            } else {
                response = await chatWithGemini(message, history, userContext);
            }
        } catch (aiError) {
            console.warn(`${provider} failed, attempting fallback:`, aiError);
            // If OpenAI failed and Gemini is available, try Gemini as fallback
            if (provider === "openai" && genAI) {
                response = await chatWithGemini(message, history, userContext);
            } else if (provider === "gemini" && openai) {
                response = await chatWithOpenAI(message, history, userContext);
            } else {
                throw aiError; // No fallback available
            }
        }

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
