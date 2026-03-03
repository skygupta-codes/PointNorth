// Aeroplan Sweet Spots — Curated high-value redemptions
// CPM = Cents Per Mile (cash value ÷ miles × 100)

export interface SweetSpot {
    id: string;
    title: string;
    origin: string;
    destination: string;
    airline: string;
    alliance: string;
    cabin: "economy" | "premiumEconomy" | "business" | "first";
    milesOneWay: number;
    cashValueCAD: number; // approximate cash ticket price
    cpm: number; // cents per mile
    rating: "exceptional" | "great" | "good";
    description: string;
    tip: string;
    popularMonths: string;
}

export const SWEET_SPOTS: SweetSpot[] = [
    {
        id: "mini-rtw-business",
        title: "Mini Round-the-World",
        origin: "Any Canadian city",
        destination: "Multiple stops",
        airline: "Star Alliance partners",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 200000,
        cashValueCAD: 25000,
        cpm: 12.5,
        rating: "exceptional",
        description: "The ultimate Aeroplan hack. Visit 2-3 continents in business class with up to 16 segments.",
        tip: "Book 330+ days in advance. Use ANA for transpacific and Lufthansa for transatlantic legs for the best products.",
        popularMonths: "Sep–Nov, Apr–May",
    },
    {
        id: "yvr-nrt-ana-j",
        title: "Vancouver → Tokyo (ANA)",
        origin: "YVR",
        destination: "NRT",
        airline: "ANA (All Nippon Airways)",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 75000,
        cashValueCAD: 8000,
        cpm: 10.7,
        rating: "exceptional",
        description: "ANA's 'The Room' business class is consistently ranked #1 worldwide. Direct flight from Vancouver.",
        tip: "ANA releases award space exactly 355 days out. Set a calendar reminder.",
        popularMonths: "Mar–May, Oct–Nov",
    },
    {
        id: "yyz-ist-tk-j",
        title: "Toronto → Istanbul (Turkish)",
        origin: "YYZ",
        destination: "IST",
        airline: "Turkish Airlines",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 70000,
        cashValueCAD: 7500,
        cpm: 10.7,
        rating: "exceptional",
        description: "Turkish Airlines business class with IST lounge (the best in the world). Gateway to 300+ destinations.",
        tip: "Book early and use IST as a stopover to explore Turkey before continuing to your final destination.",
        popularMonths: "Apr–Jun, Sep–Oct",
    },
    {
        id: "yyz-lhr-lh-j",
        title: "Toronto → London (Lufthansa via FRA)",
        origin: "YYZ",
        destination: "LHR",
        airline: "Lufthansa",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 70000,
        cashValueCAD: 6500,
        cpm: 9.3,
        rating: "exceptional",
        description: "Lufthansa's new Allegris business class suite via Frankfurt. First Class Terminal access with connecting flights.",
        tip: "Look for FRA connections — Lufthansa First Class Terminal is world-class even for business class passengers connecting.",
        popularMonths: "Year-round",
    },
    {
        id: "yul-cdg-ac-j",
        title: "Montréal → Paris (Air Canada)",
        origin: "YUL",
        destination: "CDG",
        airline: "Air Canada",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 60000,
        cashValueCAD: 5500,
        cpm: 9.2,
        rating: "exceptional",
        description: "Direct flight on AC's 787 Dreamliner business class. Reverse herringbone seats, excellent Montréal departure.",
        tip: "Air Canada direct flights have more award availability than partner routes. Check AC.com for best dates.",
        popularMonths: "May–Sep",
    },
    {
        id: "yyz-sin-sq-j",
        title: "Toronto → Singapore (Singapore Airlines)",
        origin: "YYZ",
        destination: "SIN",
        airline: "Singapore Airlines",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 90000,
        cashValueCAD: 9500,
        cpm: 10.6,
        rating: "exceptional",
        description: "Singapore Airlines business class — the gold standard. Route via FRA or connecting through Star Alliance hubs.",
        tip: "SQ releases partner award space sporadically. Check frequently or use ExpertFlyer alerts.",
        popularMonths: "Jan–Mar, Oct–Dec",
    },
    {
        id: "domestic-short-y",
        title: "Domestic Short-haul",
        origin: "Any → Any (Canada)",
        destination: "Under 2,200 km",
        airline: "Air Canada",
        alliance: "Star Alliance",
        cabin: "economy",
        milesOneWay: 6000,
        cashValueCAD: 300,
        cpm: 5.0,
        rating: "great",
        description: "Quick domestic hops for just 6,000 points. YOW↔YYZ, YYZ↔YUL, YVR↔YYC — all great value.",
        tip: "Book fixed-rate rewards for best price. Avoid holiday weekends when market fare awards spike.",
        popularMonths: "Year-round",
    },
    {
        id: "yyz-hnl-hawaii-y",
        title: "Toronto → Honolulu (Hawaii)",
        origin: "YYZ",
        destination: "HNL",
        airline: "Air Canada / United",
        alliance: "Star Alliance",
        cabin: "economy",
        milesOneWay: 25000,
        cashValueCAD: 800,
        cpm: 3.2,
        rating: "great",
        description: "Hawaii for 25K points one-way. Connect through SFO or LAX on United or AC.",
        tip: "Shoulder season (Apr–May, Sep–Oct) has the best award availability and weather.",
        popularMonths: "Apr–May, Sep–Oct",
    },
    {
        id: "yyz-gru-ac-j",
        title: "Toronto → São Paulo (Air Canada)",
        origin: "YYZ",
        destination: "GRU",
        airline: "Air Canada",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 55000,
        cashValueCAD: 5000,
        cpm: 9.1,
        rating: "great",
        description: "Direct overnight flight to Brazil in AC business class 787. One of the best values in the chart.",
        tip: "Book during Brazilian winter (Jun–Aug) for fewer crowds and excellent award availability.",
        popularMonths: "Jun–Aug",
    },
    {
        id: "yyc-nrt-j",
        title: "Calgary → Tokyo (via YVR)",
        origin: "YYC",
        destination: "NRT",
        airline: "ANA via Air Canada",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 75000,
        cashValueCAD: 7000,
        cpm: 9.3,
        rating: "great",
        description: "Connect in YVR for ANA's phenomenal business class to Tokyo. Same 75K price as direct YVR flights.",
        tip: "Aeroplan doesn't charge extra for the domestic connection — use it to your advantage from any Canadian city.",
        popularMonths: "Mar–May, Oct–Nov",
    },
    {
        id: "yyz-cdg-swiss-f",
        title: "Toronto → Paris (Swiss First via ZRH)",
        origin: "YYZ",
        destination: "CDG",
        airline: "Swiss International Air Lines",
        alliance: "Star Alliance",
        cabin: "first",
        milesOneWay: 90000,
        cashValueCAD: 12000,
        cpm: 13.3,
        rating: "exceptional",
        description: "Swiss First Class is among the best in the sky. Connect in Zürich for the Swiss First Class Lounge experience.",
        tip: "Swiss releases First Class awards very close to departure (2-14 days). Book flexible dates and check daily.",
        popularMonths: "Year-round (last-minute)",
    },
    {
        id: "yyz-add-et-j",
        title: "Toronto → Addis Ababa (Ethiopian)",
        origin: "YYZ",
        destination: "ADD",
        airline: "Ethiopian Airlines",
        alliance: "Star Alliance",
        cabin: "business",
        milesOneWay: 70000,
        cashValueCAD: 5500,
        cpm: 7.9,
        rating: "great",
        description: "Ethiopian's 787 business class with a direct YYZ route. Gateway to East Africa and connections to 60+ African cities.",
        tip: "Ethiopian's own award space is generous. Great for connecting to Kenya, Tanzania, or Southern Africa.",
        popularMonths: "Jun–Sep, Dec–Jan",
    },
];

// Rating display helpers
export const RATING_STYLES = {
    exceptional: { label: "Exceptional Value", color: "bg-emerald-100 text-emerald-800", icon: "🌟" },
    great: { label: "Great Value", color: "bg-amber-100 text-amber-800", icon: "⭐" },
    good: { label: "Good Value", color: "bg-gray-100 text-gray-700", icon: "✓" },
} as const;

export function formatMiles(miles: number): string {
    return miles >= 1000 ? `${(miles / 1000).toFixed(miles % 1000 === 0 ? 0 : 1)}K` : String(miles);
}

export function formatCPM(cpm: number): string {
    return `${cpm.toFixed(1)}¢/pt`;
}
