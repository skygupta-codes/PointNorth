// Duffel API client — cash flight price lookups
import { Duffel } from "@duffel/api";

// ─── Types ─────────────────────────────────────────────

export interface CashFlightResult {
    totalCad: number;
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    durationMinutes: number;
    stops: number;
    offerId: string;
}

// ─── Helpers ───────────────────────────────────────────

/** Parse ISO 8601 duration (e.g. "PT13H35M") into total minutes */
function parseIsoDuration(iso: string): number {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    return hours * 60 + minutes;
}

// ─── Client ────────────────────────────────────────────

const duffel = new Duffel({
    token: process.env.DUFFEL_API_KEY || "",
});

// ─── Flight Price Search ───────────────────────────────

export async function getCashFlightPrices(params: {
    origin: string;
    destination: string;
    departureDate: string;
    cabin: "economy" | "premium_economy" | "business" | "first";
}): Promise<CashFlightResult[]> {
    try {
        const offerRequest = await duffel.offerRequests.create({
            slices: [
                {
                    origin: params.origin,
                    destination: params.destination,
                    departure_date: params.departureDate,
                    departure_time: null,
                    arrival_time: null,
                },
            ],
            passengers: [{ type: "adult" as const }],
            cabin_class: params.cabin,
        });

        const offers = offerRequest.data.offers ?? [];

        const results: CashFlightResult[] = offers
            .slice(0, 5)
            .map((offer) => {
                const firstSlice = offer.slices[0];
                const firstSegment = firstSlice?.segments[0];
                const lastSegment =
                    firstSlice?.segments[firstSlice.segments.length - 1];

                return {
                    totalCad: parseFloat(offer.total_amount),
                    airline:
                        firstSegment?.marketing_carrier?.name ?? "Unknown",
                    flightNumber: firstSegment
                        ? `${firstSegment.marketing_carrier?.iata_code ?? ""}${firstSegment.marketing_carrier_flight_number}`
                        : "",
                    departureTime:
                        firstSegment?.departing_at ?? "",
                    arrivalTime:
                        lastSegment?.arriving_at ?? "",
                    durationMinutes: parseIsoDuration(
                        firstSlice?.duration ?? "PT0M"
                    ),
                    stops: Math.max(
                        0,
                        (firstSlice?.segments.length ?? 1) - 1
                    ),
                    offerId: offer.id,
                };
            })
            .sort((a, b) => a.totalCad - b.totalCad);

        return results;
    } catch (error) {
        console.error("Duffel getCashFlightPrices error:", error);
        return [];
    }
}
