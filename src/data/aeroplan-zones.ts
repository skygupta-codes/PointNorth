// Aeroplan Zone Mapping — Airport codes to Aeroplan award zones
// Used by the Zone Calculator to determine award pricing

export interface Airport {
    code: string;
    name: string;
    city: string;
    country: string;
    zone: string; // maps to AwardZonePair.id prefix
}

// Zone determination is based on origin+destination pair
// This file maps airports to their region for zone pair lookup

export const AIRPORTS: Airport[] = [
    // ─── CANADA ──────────────────────────────────────────
    { code: "YYZ", name: "Toronto Pearson Intl", city: "Toronto", country: "CA", zone: "canada" },
    { code: "YVR", name: "Vancouver Intl", city: "Vancouver", country: "CA", zone: "canada" },
    { code: "YUL", name: "Montréal-Trudeau Intl", city: "Montréal", country: "CA", zone: "canada" },
    { code: "YYC", name: "Calgary Intl", city: "Calgary", country: "CA", zone: "canada" },
    { code: "YOW", name: "Ottawa Macdonald-Cartier Intl", city: "Ottawa", country: "CA", zone: "canada" },
    { code: "YEG", name: "Edmonton Intl", city: "Edmonton", country: "CA", zone: "canada" },
    { code: "YWG", name: "Winnipeg James Armstrong Richardson Intl", city: "Winnipeg", country: "CA", zone: "canada" },
    { code: "YHZ", name: "Halifax Stanfield Intl", city: "Halifax", country: "CA", zone: "canada" },
    { code: "YQB", name: "Québec City Jean Lesage Intl", city: "Québec City", country: "CA", zone: "canada" },
    { code: "YXE", name: "Saskatoon John G. Diefenbaker Intl", city: "Saskatoon", country: "CA", zone: "canada" },
    { code: "YQR", name: "Regina Intl", city: "Regina", country: "CA", zone: "canada" },
    { code: "YYJ", name: "Victoria Intl", city: "Victoria", country: "CA", zone: "canada" },
    { code: "YKA", name: "Kamloops", city: "Kamloops", country: "CA", zone: "canada" },
    { code: "YLW", name: "Kelowna Intl", city: "Kelowna", country: "CA", zone: "canada" },
    { code: "YXU", name: "London Intl", city: "London", country: "CA", zone: "canada" },
    { code: "YQT", name: "Thunder Bay Intl", city: "Thunder Bay", country: "CA", zone: "canada" },
    { code: "YSB", name: "Greater Sudbury", city: "Sudbury", country: "CA", zone: "canada" },
    { code: "YZF", name: "Yellowknife", city: "Yellowknife", country: "CA", zone: "canada" },
    { code: "YXY", name: "Erik Nielsen Whitehorse Intl", city: "Whitehorse", country: "CA", zone: "canada" },
    { code: "YFB", name: "Iqaluit", city: "Iqaluit", country: "CA", zone: "canada" },
    { code: "YQM", name: "Greater Moncton Roméo LeBlanc Intl", city: "Moncton", country: "CA", zone: "canada" },
    { code: "YFC", name: "Fredericton Intl", city: "Fredericton", country: "CA", zone: "canada" },
    { code: "YSJ", name: "Saint John", city: "Saint John", country: "CA", zone: "canada" },
    { code: "YYT", name: "St. John's Intl", city: "St. John's", country: "CA", zone: "canada" },
    { code: "YDF", name: "Deer Lake Regional", city: "Deer Lake", country: "CA", zone: "canada" },
    { code: "YQX", name: "Gander Intl", city: "Gander", country: "CA", zone: "canada" },
    { code: "YHM", name: "John C. Munro Hamilton Intl", city: "Hamilton", country: "CA", zone: "canada" },
    { code: "YKF", name: "Region of Waterloo Intl", city: "Kitchener", country: "CA", zone: "canada" },
    { code: "YXX", name: "Abbotsford Intl", city: "Abbotsford", country: "CA", zone: "canada" },
    { code: "YCD", name: "Nanaimo", city: "Nanaimo", country: "CA", zone: "canada" },
    { code: "YMM", name: "Fort McMurray Intl", city: "Fort McMurray", country: "CA", zone: "canada" },
    { code: "YGP", name: "Michel-Pouliot Gaspé", city: "Gaspé", country: "CA", zone: "canada" },
    { code: "YQY", name: "J.A. Douglas McCurdy Sydney", city: "Sydney", country: "CA", zone: "canada" },
    { code: "YCG", name: "West Kootenay Regional", city: "Castlegar", country: "CA", zone: "canada" },
    { code: "YPR", name: "Prince Rupert", city: "Prince Rupert", country: "CA", zone: "canada" },

    // ─── UNITED STATES ───────────────────────────────────
    { code: "JFK", name: "John F. Kennedy Intl", city: "New York", country: "US", zone: "us" },
    { code: "LGA", name: "LaGuardia", city: "New York", country: "US", zone: "us" },
    { code: "EWR", name: "Newark Liberty Intl", city: "Newark", country: "US", zone: "us" },
    { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles", country: "US", zone: "us" },
    { code: "ORD", name: "O'Hare Intl", city: "Chicago", country: "US", zone: "us" },
    { code: "SFO", name: "San Francisco Intl", city: "San Francisco", country: "US", zone: "us" },
    { code: "MIA", name: "Miami Intl", city: "Miami", country: "US", zone: "us" },
    { code: "DFW", name: "Dallas/Fort Worth Intl", city: "Dallas", country: "US", zone: "us" },
    { code: "ATL", name: "Hartsfield-Jackson Atlanta Intl", city: "Atlanta", country: "US", zone: "us" },
    { code: "SEA", name: "Seattle-Tacoma Intl", city: "Seattle", country: "US", zone: "us" },
    { code: "BOS", name: "Boston Logan Intl", city: "Boston", country: "US", zone: "us" },
    { code: "DEN", name: "Denver Intl", city: "Denver", country: "US", zone: "us" },
    { code: "IAD", name: "Washington Dulles Intl", city: "Washington D.C.", country: "US", zone: "us" },
    { code: "DCA", name: "Ronald Reagan Washington National", city: "Washington D.C.", country: "US", zone: "us" },
    { code: "PHX", name: "Phoenix Sky Harbor Intl", city: "Phoenix", country: "US", zone: "us" },
    { code: "LAS", name: "Harry Reid Intl", city: "Las Vegas", country: "US", zone: "us" },
    { code: "MCO", name: "Orlando Intl", city: "Orlando", country: "US", zone: "us" },
    { code: "MSP", name: "Minneapolis-Saint Paul Intl", city: "Minneapolis", country: "US", zone: "us" },
    { code: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "US", zone: "us" },
    { code: "SAN", name: "San Diego Intl", city: "San Diego", country: "US", zone: "us" },
    { code: "TPA", name: "Tampa Intl", city: "Tampa", country: "US", zone: "us" },
    { code: "FLL", name: "Fort Lauderdale-Hollywood Intl", city: "Fort Lauderdale", country: "US", zone: "us" },
    { code: "HNL", name: "Daniel K. Inouye Intl", city: "Honolulu", country: "US", zone: "us" },
    { code: "OGG", name: "Kahului", city: "Maui", country: "US", zone: "us" },
    { code: "ANC", name: "Ted Stevens Anchorage Intl", city: "Anchorage", country: "US", zone: "us" },
    { code: "PHL", name: "Philadelphia Intl", city: "Philadelphia", country: "US", zone: "us" },
    { code: "CLT", name: "Charlotte Douglas Intl", city: "Charlotte", country: "US", zone: "us" },
    { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "US", zone: "us" },
    { code: "SLC", name: "Salt Lake City Intl", city: "Salt Lake City", country: "US", zone: "us" },
    { code: "PDX", name: "Portland Intl", city: "Portland", country: "US", zone: "us" },
    { code: "BUF", name: "Buffalo Niagara Intl", city: "Buffalo", country: "US", zone: "us" },

    // ─── CARIBBEAN / MEXICO / CENTRAL AMERICA ────────────
    { code: "CUN", name: "Cancún Intl", city: "Cancún", country: "MX", zone: "caribbean" },
    { code: "MEX", name: "Mexico City Intl", city: "Mexico City", country: "MX", zone: "caribbean" },
    { code: "SJD", name: "Los Cabos Intl", city: "Los Cabos", country: "MX", zone: "caribbean" },
    { code: "PVR", name: "Puerto Vallarta Intl", city: "Puerto Vallarta", country: "MX", zone: "caribbean" },
    { code: "MBJ", name: "Sangster Intl", city: "Montego Bay", country: "JM", zone: "caribbean" },
    { code: "NAS", name: "Lynden Pindling Intl", city: "Nassau", country: "BS", zone: "caribbean" },
    { code: "PUJ", name: "Punta Cana Intl", city: "Punta Cana", country: "DO", zone: "caribbean" },
    { code: "SJU", name: "Luis Muñoz Marín Intl", city: "San Juan", country: "PR", zone: "caribbean" },
    { code: "BOG", name: "El Dorado Intl", city: "Bogotá", country: "CO", zone: "caribbean" },
    { code: "PTY", name: "Tocumen Intl", city: "Panama City", country: "PA", zone: "caribbean" },
    { code: "SJO", name: "Juan Santamaría Intl", city: "San José", country: "CR", zone: "caribbean" },
    { code: "HAV", name: "José Martí Intl", city: "Havana", country: "CU", zone: "caribbean" },
    { code: "AUA", name: "Queen Beatrix Intl", city: "Aruba", country: "AW", zone: "caribbean" },
    { code: "BGI", name: "Grantley Adams Intl", city: "Bridgetown", country: "BB", zone: "caribbean" },

    // ─── EUROPE ──────────────────────────────────────────
    { code: "LHR", name: "London Heathrow", city: "London", country: "GB", zone: "europe" },
    { code: "LGW", name: "London Gatwick", city: "London", country: "GB", zone: "europe" },
    { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "FR", zone: "europe" },
    { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "DE", zone: "europe" },
    { code: "MUC", name: "Munich", city: "Munich", country: "DE", zone: "europe" },
    { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "NL", zone: "europe" },
    { code: "FCO", name: "Leonardo da Vinci–Fiumicino", city: "Rome", country: "IT", zone: "europe" },
    { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "ES", zone: "europe" },
    { code: "BCN", name: "Barcelona–El Prat", city: "Barcelona", country: "ES", zone: "europe" },
    { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR", zone: "europe" },
    { code: "ZRH", name: "Zürich", city: "Zürich", country: "CH", zone: "europe" },
    { code: "VIE", name: "Vienna Intl", city: "Vienna", country: "AT", zone: "europe" },
    { code: "LIS", name: "Lisbon Humberto Delgado", city: "Lisbon", country: "PT", zone: "europe" },
    { code: "ATH", name: "Athens Intl", city: "Athens", country: "GR", zone: "europe" },
    { code: "DUB", name: "Dublin", city: "Dublin", country: "IE", zone: "europe" },
    { code: "EDI", name: "Edinburgh", city: "Edinburgh", country: "GB", zone: "europe" },
    { code: "CPH", name: "Copenhagen", city: "Copenhagen", country: "DK", zone: "europe" },
    { code: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "NO", zone: "europe" },
    { code: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "SE", zone: "europe" },
    { code: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "FI", zone: "europe" },
    { code: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "PL", zone: "europe" },
    { code: "PRG", name: "Václav Havel Prague", city: "Prague", country: "CZ", zone: "europe" },
    { code: "BRU", name: "Brussels", city: "Brussels", country: "BE", zone: "europe" },
    { code: "GVA", name: "Geneva", city: "Geneva", country: "CH", zone: "europe" },
    { code: "KEF", name: "Keflavík Intl", city: "Reykjavík", country: "IS", zone: "europe" },

    // ─── ASIA / PACIFIC ──────────────────────────────────
    { code: "NRT", name: "Narita Intl", city: "Tokyo", country: "JP", zone: "asia" },
    { code: "HND", name: "Haneda", city: "Tokyo", country: "JP", zone: "asia" },
    { code: "HKG", name: "Hong Kong Intl", city: "Hong Kong", country: "HK", zone: "asia" },
    { code: "SIN", name: "Changi", city: "Singapore", country: "SG", zone: "asia" },
    { code: "ICN", name: "Incheon Intl", city: "Seoul", country: "KR", zone: "asia" },
    { code: "PEK", name: "Beijing Capital Intl", city: "Beijing", country: "CN", zone: "asia" },
    { code: "PVG", name: "Shanghai Pudong Intl", city: "Shanghai", country: "CN", zone: "asia" },
    { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "TH", zone: "asia" },
    { code: "DEL", name: "Indira Gandhi Intl", city: "New Delhi", country: "IN", zone: "asia" },
    { code: "BOM", name: "Chhatrapati Shivaji Maharaj Intl", city: "Mumbai", country: "IN", zone: "asia" },
    { code: "MNL", name: "Ninoy Aquino Intl", city: "Manila", country: "PH", zone: "asia" },
    { code: "KIX", name: "Kansai Intl", city: "Osaka", country: "JP", zone: "asia" },
    { code: "TPE", name: "Taiwan Taoyuan Intl", city: "Taipei", country: "TW", zone: "asia" },
    { code: "SGN", name: "Tan Son Nhat Intl", city: "Ho Chi Minh City", country: "VN", zone: "asia" },
    { code: "HAN", name: "Noi Bai Intl", city: "Hanoi", country: "VN", zone: "asia" },
    { code: "KUL", name: "Kuala Lumpur Intl", city: "Kuala Lumpur", country: "MY", zone: "asia" },

    // ─── SOUTH AMERICA ───────────────────────────────────
    { code: "GRU", name: "São Paulo–Guarulhos Intl", city: "São Paulo", country: "BR", zone: "south-america" },
    { code: "EZE", name: "Ministro Pistarini Intl", city: "Buenos Aires", country: "AR", zone: "south-america" },
    { code: "SCL", name: "Arturo Merino Benítez Intl", city: "Santiago", country: "CL", zone: "south-america" },
    { code: "LIM", name: "Jorge Chávez Intl", city: "Lima", country: "PE", zone: "south-america" },
    { code: "GIG", name: "Rio de Janeiro–Galeão Intl", city: "Rio de Janeiro", country: "BR", zone: "south-america" },

    // ─── MIDDLE EAST / AFRICA ────────────────────────────
    { code: "DXB", name: "Dubai Intl", city: "Dubai", country: "AE", zone: "middle-east-africa" },
    { code: "DOH", name: "Hamad Intl", city: "Doha", country: "QA", zone: "middle-east-africa" },
    { code: "TLV", name: "Ben Gurion Intl", city: "Tel Aviv", country: "IL", zone: "middle-east-africa" },
    { code: "ADD", name: "Bole Intl", city: "Addis Ababa", country: "ET", zone: "middle-east-africa" },
    { code: "JNB", name: "O.R. Tambo Intl", city: "Johannesburg", country: "ZA", zone: "middle-east-africa" },
    { code: "CPT", name: "Cape Town Intl", city: "Cape Town", country: "ZA", zone: "middle-east-africa" },
    { code: "CAI", name: "Cairo Intl", city: "Cairo", country: "EG", zone: "middle-east-africa" },
    { code: "CMN", name: "Mohammed V Intl", city: "Casablanca", country: "MA", zone: "middle-east-africa" },
    { code: "NBO", name: "Jomo Kenyatta Intl", city: "Nairobi", country: "KE", zone: "middle-east-africa" },

    // ─── OCEANIA ──────────────────────────────────────────
    { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "AU", zone: "oceania" },
    { code: "MEL", name: "Melbourne Tullamarine", city: "Melbourne", country: "AU", zone: "oceania" },
    { code: "BNE", name: "Brisbane", city: "Brisbane", country: "AU", zone: "oceania" },
    { code: "AKL", name: "Auckland", city: "Auckland", country: "NZ", zone: "oceania" },
    { code: "PPT", name: "Faa'a Intl", city: "Papeete", country: "PF", zone: "oceania" },
    { code: "NAN", name: "Nadi Intl", city: "Nadi", country: "FJ", zone: "oceania" },
];

// ─── HELPERS ─────────────────────────────────────────────

export function getAirport(code: string): Airport | undefined {
    return AIRPORTS.find(
        (a) => a.code.toUpperCase() === code.toUpperCase()
    );
}

export function searchAirports(query: string): Airport[] {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return AIRPORTS.filter(
        (a) =>
            a.code.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q)
    ).slice(0, 10);
}

// Determine the zone pair ID for two airports
export function getZonePairId(originZone: string, destZone: string): string | null {
    // Same country routing
    if (originZone === "canada" && destZone === "canada") return "within-canada-short"; // simplified
    if (originZone === "canada" && destZone === "us") return "canada-us-short"; // simplified
    if (originZone === "us" && destZone === "canada") return "canada-us-short";

    // International
    const zoneMap: Record<string, string> = {
        "caribbean": "canada-caribbean",
        "europe": "canada-europe",
        "asia": "canada-asia",
        "south-america": "canada-south-america",
        "middle-east-africa": "canada-middle-east-africa",
        "oceania": "canada-oceania",
    };

    // From Canada to international
    if (originZone === "canada" || originZone === "us") {
        return zoneMap[destZone] || null;
    }
    // From international to Canada
    if (destZone === "canada" || destZone === "us") {
        return zoneMap[originZone] || null;
    }

    return null;
}

export const COUNTRY_FLAGS: Record<string, string> = {
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
