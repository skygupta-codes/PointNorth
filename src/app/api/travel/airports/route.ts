// GET /api/travel/airports?q=<search> — Airport autocomplete
import { NextResponse } from "next/server";
import { AIRPORTS } from "@/data/aeroplan-zones";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
        return NextResponse.json([]);
    }

    const query = q.toLowerCase();

    const results = AIRPORTS.filter(
        (a) =>
            a.code.toLowerCase().includes(query) ||
            a.city.toLowerCase().includes(query) ||
            a.name.toLowerCase().includes(query)
    )
        .slice(0, 8)
        .map((a) => ({
            iataCode: a.code,
            city: a.city,
            airportName: a.name,
            country: a.country,
            zone: a.zone,
            display: `${a.city} (${a.code}) · ${a.name}`,
        }));

    return NextResponse.json(results);
}
