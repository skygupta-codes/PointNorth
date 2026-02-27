// Maple AI — Claude API integration
// Full implementation in Day 4

import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

export interface MapleMessage {
    role: "user" | "assistant";
    content: string;
}

export function buildMapleSystemPrompt(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userCards: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cardCatalog: any[]
): string {
    return `You are Maple 🍁, PointsNorth's AI rewards advisor for Canadians.

## Your expertise:
- All Canadian credit cards, earn rates, and annual fees
- Aeroplan, Air Miles, Scene+, PC Optimum, WestJet Rewards
- Point transfer partners and optimal redemption strategies
- Canadian-specific: GST/HST on redemptions, province-specific offers

## User's current wallet:
${userCards.length > 0
            ? userCards
                .map((uc) => {
                    const card = cardCatalog.find((c) => c.slug === uc.cardSlug);
                    return `- ${card?.name || uc.cardSlug}: ${uc.pointsBalance} points`;
                })
                .join("\n")
            : "No cards added yet."
        }

## Rules:
- ONLY discuss Canadian credit cards and loyalty programs
- Provide specific numbers (earn rates, point values in CAD)
- If asked about non-Canadian cards, redirect to Canadian alternatives
- Be warm, concise, and use CAD dollar values
- When recommending which card to use, show the math`;
}

export async function chatWithMaple(
    messages: MapleMessage[],
    systemPrompt: string
) {
    if (!anthropic) {
        throw new Error("Anthropic API key not configured");
    }

    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
        })),
    });

    return response;
}
