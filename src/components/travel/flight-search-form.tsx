"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plane,
    MapPin,
    ArrowRight,
    CalendarDays,
    Search,
    Loader2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────

interface AirportResult {
    iataCode: string;
    city: string;
    airportName: string;
    country: string;
    zone: string;
    display: string;
}

type CabinOption = "economy" | "premium_economy" | "business" | "first";

interface FlightSearchFormProps {
    onSearch: (params: {
        origin: string;
        destination: string;
        departureDate: string;
        cabin: CabinOption;
    }) => void;
    isLoading?: boolean;
}

// ─── Constants ─────────────────────────────────────────

const CABINS: { value: CabinOption; label: string; color: string }[] = [
    { value: "economy", label: "Economy", color: "bg-gray-100 text-gray-700" },
    { value: "premium_economy", label: "Premium Economy", color: "bg-blue-50 text-blue-700" },
    { value: "business", label: "Business", color: "bg-amber-50 text-amber-700" },
    { value: "first", label: "First", color: "bg-purple-50 text-purple-700" },
];

const COUNTRY_FLAGS: Record<string, string> = {
    CA: "🇨🇦", US: "🇺🇸", MX: "🇲🇽", JM: "🇯🇲", BS: "🇧🇸", DO: "🇩🇴", PR: "🇵🇷",
    CO: "🇨🇴", PA: "🇵🇦", CR: "🇨🇷", CU: "🇨🇺", AW: "🇦🇼", BB: "🇧🇧",
    GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪", NL: "🇳🇱", IT: "🇮🇹", ES: "🇪🇸", TR: "🇹🇷",
    CH: "🇨🇭", AT: "🇦🇹", PT: "🇵🇹", GR: "🇬🇷", IE: "🇮🇪", DK: "🇩🇰", NO: "🇳🇴",
    SE: "🇸🇪", FI: "🇫🇮", PL: "🇵🇱", CZ: "🇨🇿", BE: "🇧🇪", IS: "🇮🇸",
    JP: "🇯🇵", HK: "🇭🇰", SG: "🇸🇬", KR: "🇰🇷", CN: "🇨🇳", TH: "🇹🇭",
    IN: "🇮🇳", PH: "🇵🇭", TW: "🇹🇼", VN: "🇻🇳", MY: "🇲🇾",
    BR: "🇧🇷", AR: "🇦🇷", CL: "🇨🇱", PE: "🇵🇪",
    AE: "🇦🇪", QA: "🇶🇦", IL: "🇮🇱", ET: "🇪🇹", ZA: "🇿🇦", EG: "🇪🇬", MA: "🇲🇦", KE: "🇰🇪",
    AU: "🇦🇺", NZ: "🇳🇿", PF: "🇵🇫", FJ: "🇫🇯",
};

// ─── Airport Autocomplete Hook ─────────────────────────

function useAirportSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<AirportResult[]>([]);
    const [selected, setSelected] = useState<AirportResult | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/travel/airports?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch {
            // Silently fail
        }
    }, []);

    useEffect(() => {
        if (!selected) {
            const timer = setTimeout(() => search(query), 200);
            return () => clearTimeout(timer);
        }
    }, [query, selected, search]);

    const selectAirport = (airport: AirportResult) => {
        setSelected(airport);
        setQuery(`${COUNTRY_FLAGS[airport.country] || ""} ${airport.iataCode} — ${airport.city}`);
        setShowDropdown(false);
    };

    const handleChange = (value: string) => {
        setQuery(value);
        setSelected(null);
        setShowDropdown(true);
    };

    return {
        query,
        results,
        selected,
        showDropdown,
        setShowDropdown,
        selectAirport,
        handleChange,
    };
}

// ─── Component ─────────────────────────────────────────

export default function FlightSearchForm({ onSearch, isLoading = false }: FlightSearchFormProps) {
    const origin = useAirportSearch();
    const destination = useAirportSearch();
    const [departureDate, setDepartureDate] = useState("");
    const [cabin, setCabin] = useState<CabinOption>("economy");

    // Minimum date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const canSearch =
        origin.selected &&
        destination.selected &&
        departureDate &&
        !isLoading;

    const handleSubmit = () => {
        if (!canSearch || !origin.selected || !destination.selected) return;
        onSearch({
            origin: origin.selected.iataCode,
            destination: destination.selected.iataCode,
            departureDate,
            cabin,
        });
    };

    return (
        <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-5 w-5 text-green-600" />
                    Search Flights
                    <Badge className="ml-auto bg-purple-50 text-purple-700 text-[10px]">
                        Pro
                    </Badge>
                </CardTitle>
                <p className="text-xs text-gray-400">
                    Compare Aeroplan miles vs. cash to find the best deal
                </p>
            </CardHeader>
            <CardContent>
                {/* Origin + Destination */}
                <div className="mb-4 grid gap-3 sm:grid-cols-[1fr,auto,1fr]">
                    {/* Origin */}
                    <div className="relative">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            From
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                id="flight-search-origin"
                                placeholder="City or airport code"
                                value={origin.query}
                                onChange={(e) => origin.handleChange(e.target.value)}
                                onFocus={() => origin.setShowDropdown(true)}
                                onBlur={() => setTimeout(() => origin.setShowDropdown(false), 200)}
                                className="pl-9 min-h-[44px]"
                            />
                        </div>
                        {origin.showDropdown && origin.results.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full max-h-[220px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                                {origin.results.slice(0, 5).map((a) => (
                                    <button
                                        key={a.iataCode}
                                        className="flex w-full items-center gap-2 px-3 min-h-[44px] py-2 text-left text-sm active:bg-green-50 transition-colors"
                                        onMouseDown={() => origin.selectAirport(a)}
                                    >
                                        <span>{COUNTRY_FLAGS[a.country]}</span>
                                        <span className="font-mono font-semibold">{a.iataCode}</span>
                                        <span className="text-gray-500">{a.city}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <div className="hidden items-end justify-center pb-2 sm:flex">
                        <ArrowRight className="h-5 w-5 text-gray-300" />
                    </div>

                    {/* Destination */}
                    <div className="relative">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            To
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                id="flight-search-destination"
                                placeholder="City or airport code"
                                value={destination.query}
                                onChange={(e) => destination.handleChange(e.target.value)}
                                onFocus={() => destination.setShowDropdown(true)}
                                onBlur={() => setTimeout(() => destination.setShowDropdown(false), 200)}
                                className="pl-9 min-h-[44px]"
                            />
                        </div>
                        {destination.showDropdown && destination.results.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full max-h-[220px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                                {destination.results.slice(0, 5).map((a) => (
                                    <button
                                        key={a.iataCode}
                                        className="flex w-full items-center gap-2 px-3 min-h-[44px] py-2 text-left text-sm active:bg-green-50 transition-colors"
                                        onMouseDown={() => destination.selectAirport(a)}
                                    >
                                        <span>{COUNTRY_FLAGS[a.country]}</span>
                                        <span className="font-mono font-semibold">{a.iataCode}</span>
                                        <span className="text-gray-500">{a.city}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date + Cabin Row */}
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    {/* Departure Date */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Departure Date
                        </label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                id="flight-search-date"
                                type="date"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                                min={minDate}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Cabin Class */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Cabin Class
                        </label>
                        <div className="flex gap-1 rounded-md border border-gray-200 bg-gray-50 p-1">
                            {CABINS.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setCabin(c.value)}
                                    className={`flex-1 rounded px-2 min-h-[44px] py-2 text-[11px] font-medium transition-colors ${cabin === c.value
                                        ? `${c.color} shadow-sm`
                                        : "text-gray-400 active:text-gray-600"
                                        }`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    id="flight-search-submit"
                    onClick={handleSubmit}
                    disabled={!canSearch}
                    className="w-full min-h-[48px] bg-green-600 active:bg-green-700 text-white"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching flights & Aeroplan rates…
                        </>
                    ) : (
                        <>
                            <Plane className="mr-2 h-4 w-4" />
                            Compare Miles vs. Cash
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
