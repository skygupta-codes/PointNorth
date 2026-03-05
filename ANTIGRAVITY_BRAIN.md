# 🍁 TrueNorthPoints.ca — Antigravity Master Brain
> **Version:** 2.0 · **Last Updated:** March 5, 2026  
> **Purpose:** Single source of truth for all development decisions. Read this before every prompt. Never deviate from this document without an explicit instruction from the project owner.  
> **Model:** Claude Opus 4.6 via Antigravity

---

## ⚠️ PRIME DIRECTIVES — READ FIRST

These rules are absolute. They cannot be overridden by context, convenience, or assumed intent.

1. **Never invent architecture.** If a pattern isn't in this document, ask before implementing.
2. **Never install a package** that isn't listed in the approved dependencies or explicitly requested in the current sprint.
3. **Never create a new DB table** without the exact SQL from the migrations section of this document.
4. **Never modify a file from a completed sprint** unless the current sprint explicitly says to.
5. **Always check actual file contents before editing.** Column names, import paths, and export signatures must be verified from the real codebase, not assumed.
6. **Always use named exports in App Router API routes.** `export async function POST()` not `export default`.
7. **Never break the build.** Run `npx tsc --noEmit` mentally before completing any phase. If types are uncertain, check the schema file first.
8. **Subscription gates are mandatory.** Every Pro/Plus feature must check `subscription_tier` from the `users` table before returning data.
9. **Commit after every phase.** `git add -A && git commit -m "Sprint X Phase Y: description" && git push` at the end of each phase.
10. **Test before moving on.** Each phase has a verification step. Do not start the next phase until verification passes.

---

## Part 1 — Project Identity

| Field | Value |
|---|---|
| **App Name** | TrueNorthPoints.ca |
| **Tagline** | Canada's smartest credit card & loyalty rewards optimizer |
| **Live URL** | https://truenorthpoints.ca |
| **Repo** | github.com/skygupta-codes/PointNorth |
| **Bundle ID (iOS)** | ca.truenorthpoints.app |
| **Primary Market** | Canada (all provinces, French QC support in Sprint 13) |
| **Competitive Reference** | SaveSage India (inspiration, not a clone) |
| **Project Start** | Feb 26, 2026 |
| **Target Completion** | ~March 20, 2026 |

---

## Part 2 — Tech Stack (Locked — Do Not Change)

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js | 16, App Router, Turbopack |
| Language | TypeScript | Strict mode |
| Auth | Clerk | Google + Email + Apple SSO |
| Database | Supabase | PostgreSQL, hosted on AWS us-east-1 |
| ORM | Drizzle ORM | Schema in `src/db/schema.ts` |
| Payments | Stripe | Subscriptions + Webhooks |
| AI Primary | Anthropic Claude | `claude-sonnet-4-5` as of Sprint 10 |
| AI Fallback 1 | OpenAI GPT-4o | Falls back if Claude throws |
| AI Fallback 2 | Google Gemini | `gemini-2.5-flash`, last resort |
| Flight Prices | Duffel API | REST + `@duffel/api` SDK, test mode now |
| Email | Resend | Sprint 11, `resend` package |
| Availability | Seats.aero | Sprint 12, $49 USD/mo, not yet active |
| UI Components | shadcn/ui | Radix primitives underneath |
| Icons | Lucide React | `lucide-react` package |
| Styling | Tailwind CSS | Utility classes only, no custom CSS files |
| Hosting | Vercel | Auto-deploy on push to main |
| Mobile | Capacitor | iOS only, WebView wraps live site |
| Notifications | Sonner | Toast notifications |
| i18n | next-intl | Sprint 13, not yet installed |

**Package manager:** `pnpm` — always use `pnpm add`, never `npm install` or `yarn add`.

---

## Part 3 — Project Structure (Exact Paths)

```
src/
├── app/
│   ├── (auth)/                    ← Clerk sign-in/up pages
│   ├── (dashboard)/               ← All authenticated pages
│   │   ├── dashboard/page.tsx
│   │   ├── wallet/page.tsx
│   │   ├── spending/page.tsx
│   │   ├── recommendations/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── loyalty/page.tsx
│   │   ├── aeroplan/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── upgrade/page.tsx
│   │   └── travel/page.tsx        ← Sprint 10 (new)
│   ├── api/
│   │   ├── cards/route.ts
│   │   ├── chat/route.ts
│   │   ├── loyalty-accounts/route.ts
│   │   ├── points-history/route.ts
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   ├── portal/route.ts
│   │   │   └── webhooks/route.ts
│   │   ├── travel/
│   │   │   ├── airports/route.ts   ← Sprint 10 ✅
│   │   │   ├── flight-search/route.ts ← Sprint 10 ✅
│   │   │   ├── availability/route.ts  ← Sprint 12
│   │   │   ├── saved-searches/route.ts ← Sprint 12
│   │   │   └── hotels/route.ts     ← Sprint 13
│   │   ├── cron/
│   │   │   ├── expiry-alerts/route.ts  ← Sprint 11
│   │   │   ├── fetch-alerts/route.ts   ← Sprint 11
│   │   │   ├── weekly-digest/route.ts  ← Sprint 11
│   │   │   └── check-saved-searches/route.ts ← Sprint 12
│   │   └── webhooks/
│   │       └── clerk/route.ts
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   └── dashboard-layout.tsx   ← Main sidebar nav — edit here for nav items
│   ├── aeroplan/
│   │   ├── status-tracker.tsx
│   │   ├── sweet-spots-grid.tsx
│   │   ├── zone-calculator.tsx
│   │   └── transfer-partners-panel.tsx ← Sprint 10 carry-over
│   ├── travel/                    ← Sprint 10 (all new)
│   │   ├── flight-search-form.tsx
│   │   ├── results-comparison-card.tsx
│   │   ├── value-badge.tsx
│   │   ├── shortfall-card.tsx
│   │   └── cash-options-list.tsx
│   └── ui/                        ← shadcn generated components — never edit manually
├── data/
│   ├── aeroplan-award-chart.ts    ← Zone pairs + mile costs ✅ Sprint 9
│   ├── airport-zones.ts           ← 200+ airports with zones ✅ Sprint 9
│   └── aeroplan-sweet-spots.json  ← 12 curated routes ✅ Sprint 9
├── lib/
│   ├── cards.ts                   ← 35 Canadian credit cards catalog
│   ├── email.ts                   ← Resend client (Sprint 11)
│   ├── maple/
│   │   └── build-system-prompt.ts ← Maple AI system prompt builder
│   ├── supabase/
│   │   ├── client.ts              ← Browser client
│   │   └── admin.ts               ← Service role client (server-side only)
│   └── travel/
│       ├── duffel.ts              ← Duffel API client ✅ Sprint 10
│       ├── calculations.ts        ← CPM engine ✅ Sprint 10
│       ├── seats-aero.ts          ← Sprint 12
│       └── travelpayouts.ts       ← Affiliate links ✅ Sprint 10
├── db/
│   └── schema.ts                  ← Drizzle schema — source of truth for column names
└── emails/                        ← React Email templates (Sprint 11)
    ├── welcome.tsx
    ├── expiry-warning.tsx
    ├── transfer-bonus-alert.tsx
    └── weekly-digest.tsx
```

---

## Part 4 — Database Schema (Complete)

### ⚠️ CRITICAL: Always verify column names from `src/db/schema.ts` before writing any Supabase query. Never assume column names.

### Tables Live as of Sprint 9 (7 tables)

**users**
```sql
id                UUID PRIMARY KEY
"clerkId"         TEXT UNIQUE NOT NULL    ← note: camelCase, quoted
email             TEXT NOT NULL
"firstName"       TEXT
"lastName"        TEXT
province          TEXT
subscription_tier TEXT DEFAULT 'free'     ← 'free' | 'plus' | 'pro'
stripe_customer_id TEXT
stripe_subscription_id TEXT
locale            TEXT DEFAULT 'en'       ← added Sprint 13
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

**user_cards**
```sql
id                    UUID PRIMARY KEY
user_id               UUID REFERENCES users(id) ON DELETE CASCADE
card_id               TEXT                ← references card catalog slug
current_points_balance INTEGER DEFAULT 0  ← VERIFY: may be 'pointsBalance' in schema
points_expiry_date    DATE
notes                 TEXT
created_at            TIMESTAMPTZ DEFAULT NOW()
updated_at            TIMESTAMPTZ DEFAULT NOW()
```

**card_catalog** (static, seeded)
```sql
id               TEXT PRIMARY KEY         ← slug e.g. 'amex-cobalt'
name             TEXT NOT NULL
issuer           TEXT NOT NULL
reward_currency  TEXT NOT NULL            ← 'mr' | 'td-points' | 'rbc-avion' | 'cibc-aventura' | 'scene' | 'cash' etc.
annual_fee_cad   INTEGER
earn_rates       JSONB                    ← { grocery: 5, dining: 3, ... }
welcome_bonus    INTEGER
```

**spending_profiles**
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE
groceries   INTEGER DEFAULT 0
dining      INTEGER DEFAULT 0
gas         INTEGER DEFAULT 0
travel      INTEGER DEFAULT 0
streaming   INTEGER DEFAULT 0
shopping    INTEGER DEFAULT 0
transit     INTEGER DEFAULT 0
other       INTEGER DEFAULT 0
drugstore   INTEGER DEFAULT 0            ← added Sprint 8
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

**chat_messages**
```sql
id         UUID PRIMARY KEY
user_id    UUID REFERENCES users(id) ON DELETE CASCADE
role       TEXT CHECK (role IN ('user', 'assistant'))
content    TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

**user_loyalty_accounts**
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES users(id) ON DELETE CASCADE
program             TEXT NOT NULL        ← 'aeroplan' | 'air-miles' | 'westjet' | 'scene' | 'pc-optimum' | 'triangle' | 'marriott' | 'hilton' | 'starbucks'
current_balance     INTEGER DEFAULT 0
status_tier         TEXT
points_expiry_date  DATE
notes               TEXT
updated_at          TIMESTAMPTZ DEFAULT NOW()
```

**points_history**
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id) ON DELETE CASCADE
card_id       TEXT
program       TEXT
change_amount INTEGER NOT NULL
balance_after INTEGER NOT NULL
reason        TEXT
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### Tables Added Sprint 10

**award_search_cache** ✅ CREATED Mar 5, 2026
```sql
id          UUID PRIMARY KEY DEFAULT uuid_generate_v4()
cache_key   TEXT UNIQUE NOT NULL       ← format: "{origin}-{dest}-{date}-{cabin}"
result_json JSONB NOT NULL
cached_at   TIMESTAMPTZ DEFAULT NOW()
expires_at  TIMESTAMPTZ NOT NULL       ← 4 hours for flight search, 6 hours for availability
```

### Tables to Add Sprint 11
```sql
CREATE TABLE deal_alerts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  source            TEXT NOT NULL,
  source_url        TEXT UNIQUE NOT NULL,
  excerpt           TEXT,
  keywords          TEXT[],
  alert_type        TEXT CHECK (alert_type IN ('transfer_bonus','flash_sale','increased_offer','devaluation','promo')),
  programs_affected TEXT[],
  trust_score       INTEGER DEFAULT 3,
  is_active         BOOLEAN DEFAULT true,
  expires_at        TIMESTAMPTZ,
  discovered_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deal_alerts_active ON deal_alerts(is_active, discovered_at DESC);
```

### Tables to Add Sprint 12
```sql
CREATE TABLE user_saved_searches (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
  origin_airport        CHAR(3),
  destination_airport   CHAR(3),
  cabin                 TEXT,
  earliest_date         DATE,
  latest_date           DATE,
  alert_on_availability BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own searches" ON user_saved_searches
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE "clerkId" = current_setting('app.clerk_id', true)
  ));
```

### Tables to Add Sprint 13
```sql
CREATE TABLE hotel_programs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  point_currency    TEXT NOT NULL,
  transfer_partners TEXT[],
  fifth_night_free  BOOLEAN DEFAULT false,
  point_value_cents DECIMAL(5,3),
  website           TEXT,
  last_verified     DATE
);

CREATE TABLE hotel_award_categories (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id              UUID REFERENCES hotel_programs(id),
  category_number         INTEGER NOT NULL,
  category_label          TEXT,
  points_per_night        INTEGER NOT NULL,
  points_per_night_peak   INTEGER,
  points_per_night_off_peak INTEGER,
  cash_value_low_cad      INTEGER,
  cash_value_high_cad     INTEGER,
  last_verified           DATE,
  UNIQUE(program_id, category_number)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
```

### Tables to Add Sprint 14
```sql
CREATE TABLE user_eupgrade_certificates (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 0,
  expiry_date  DATE,
  status_tier  TEXT,
  target_routes TEXT[],
  notes        TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 5 — Environment Variables (Complete Registry)

### Currently Active (in .env.local + Vercel)

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase session pooler)
DATABASE_URL=postgresql://postgres.yzsbkzxnzlqqfplpnrpk:...

# AI Providers
ANTHROPIC_API_KEY=                  ← Claude primary (Sprint 10)
OPENAI_API_KEY=                     ← GPT-4o fallback
GEMINI_API_KEY=                     ← Gemini 2.5 Flash last resort

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Flight Prices — Sprint 10
DUFFEL_API_KEY=duffel_test_REDACTED
# ⚠️ Switch to duffel_live_... before launch

# Email — Sprint 11 (not yet active)
# RESEND_API_KEY=re_REPLACE_ME
```

### To Add Each Sprint

```bash
# Sprint 11
RESEND_API_KEY=                     # resend.com — 3,000/mo free
CRON_SECRET=                        # openssl rand -hex 32
ADMIN_EMAIL=                        # your@email.com
REDDIT_CLIENT_ID=                   # reddit.com/prefs/apps
REDDIT_CLIENT_SECRET=

# Sprint 12
SEATS_AERO_API_KEY=                 # seats.aero/api — $49 USD/mo
                                    # ⚠️ Only add after 10 Pro subscribers confirmed

# Sprint 10 optional (monetization)
TRAVELPAYOUTS_MARKER=               # travelpayouts.com — affiliate revenue
```

---

## Part 6 — Subscription Tier Gates (Mandatory)

Every feature must enforce tier gates server-side. Client-side gates are UX only — never security.

| Feature | Gate | How to Check |
|---|---|---|
| Card wallet (>3 cards) | Plus+ | `subscription_tier IN ('plus','pro')` |
| AI chat (unlimited) | Plus+ | Same |
| Expiry alerts (email) | Plus+ | Same |
| Travel Planner | Pro | `subscription_tier = 'pro'` |
| Expert Consultations | Pro | Same |
| Live availability (Seats.aero) | Pro | Same |
| Aeroplan hub | Free | No gate |
| Loyalty programs | Free | No gate |
| Deal alert feed (view) | Free | No gate |
| Deal alert emails | Plus+ | `subscription_tier IN ('plus','pro')` |

**Standard gate pattern in API routes:**
```typescript
const { data: user } = await supabaseAdmin
  .from("users")
  .select("id, subscription_tier")
  .eq("clerkId", userId)
  .single();

// Pro gate:
if (user?.subscription_tier !== "pro") {
  return NextResponse.json({ error: "Pro subscription required", upgrade: true }, { status: 403 });
}

// Plus+ gate:
if (!["plus", "pro"].includes(user?.subscription_tier ?? "")) {
  return NextResponse.json({ error: "Plus subscription required", upgrade: true }, { status: 403 });
}
```

**Standard gate pattern on pages:**
```typescript
// In server component — check BEFORE rendering Pro content
const user = await getCurrentUser(); // whatever pattern exists in codebase
if (user.subscription_tier !== "pro") {
  return <UpgradeBanner requiredTier="pro" />;
}
```

---

## Part 7 — AI Provider Chain (Updated Sprint 10)

**Order:** Claude (primary) → GPT-4o (fallback 1) → Gemini (fallback 2)

```typescript
// src/app/api/chat/route.ts — provider order
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
// Gemini already configured

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Primary: Claude
try {
  console.log("AI: using claude-sonnet-4-5");
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: conversationHistory,
  });
  // pipe to response
} catch {
  // Fallback 1: GPT-4o
  try {
    console.log("AI: falling back to gpt-4o");
    // ...
  } catch {
    // Fallback 2: Gemini
    console.log("AI: falling back to gemini-2.5-flash");
    // ...
  }
}
```

**Maple System Prompt must include (in order):**
1. Identity block — "You are Maple 🍁, Canada's smartest rewards advisor..."
2. User's card wallet with balances and reward currencies
3. User's spending profile by category
4. User's loyalty accounts with balances (Sprint 8+)
5. Aeroplan intelligence block (Sprint 10+):
   - Aeroplan balance + status tier
   - Cards that transfer to Aeroplan with balances
   - Sweet spots reference (hardcoded — do not fetch)
   - Fuel surcharge rule (always recommend non-AC operated transatlantic)
   - CPM calculation rule (show the math)
6. Canadian context rules:
   - Always quote prices in CAD
   - Reference Canadian-specific earn categories (Shoppers, Costco, Loblaws)
   - Never recommend US-only cards

---

## Part 8 — Sprint Completion Status

| Sprint | Name | Status | Date | Completion |
|---|---|---|---|---|
| 1 | Project Scaffold | ✅ Done | Feb 26 | — |
| 2 | Core Platform | ✅ Done | Feb 27 | — |
| 3 | Spending & Recommendations | ✅ Done | Feb 27 | — |
| 4 | AI Chat (Maple) | ✅ Done | Feb 27 | — |
| 5 | Polish & UX | ✅ Done | Feb 27 | — |
| 6 | iOS App + Deployment | ✅ Done | Mar 1 | 32% |
| 7 | Monetization (Stripe) | ✅ Done | Mar 2 | 40% |
| 8 | Points & Loyalty Tracking | ✅ Done | Mar 2 | 51% |
| 9 | Aeroplan Deep Dive | ✅ Done | Mar 3 | 59% |
| **10** | **Travel Planner Phase 1** | **🔄 In Progress** | Mar 4–5 | **70%** |
| 11 | Email + Deal Alerts | 🔲 Next | Mar 6–7 | 78% |
| 12 | Travel Planner Phase 2 | 🔲 Planned | Mar 8–10 | 86% |
| 13 | French + Hotels | 🔲 Planned | Mar 11–13 | 92% |
| 14 | Experts + WestJet + eUpgrades | 🔲 Planned | Mar 14–15 | 100% |

---

## Part 9 — Sprint 10 Detail (Current Sprint)

**Duration:** 4 days · **Status:** In Progress  
**Pro gate:** Travel Planner · **All users:** Maple + Aeroplan updates

### Confirmed Completed ✅
- Phase 2A: `src/lib/travel/duffel.ts` — Duffel SDK client, getCashFlightPrices()
- Phase 2B: `src/app/api/travel/airports/route.ts` — airport autocomplete, verified returning JSON
- Phase 3A: `src/lib/travel/calculations.ts` — analyzeRedemption(), calcShortfall()
- Phase 3B: `src/app/api/travel/flight-search/route.ts` — master search, verified returning full result JSON

### Verified API Response Shape (from live test Mar 5, 2026)
```json
{
  "origin": "YYZ", "destination": "LHR",
  "departureDate": "2026-07-15", "cabin": "business",
  "milesCost": 60000,
  "cashOptions": [{ "totalCad": 1797.75, "airline": "Duffel Airways", ... }],
  "analysis": { "centsPerMile": 3, "valueTier": "great", ... },
  "userAeroplanBalance": 2500,
  "shortfall": { "shortfall": 57500, "canCover": false, "strategy": null },
  "transferableCards": [{ "name": "American Express Platinum Card", "balance": 46285, "currency": "mr" }],
  "liveAvailability": null,
  "availabilityNote": "Live seat availability coming in the next update."
}
```

**Note:** cashOptions showing "Duffel Airways" is expected in test mode. Real airlines appear with live token.  
**Note:** milesCost showing 60,000 instead of 65,000 — zone resolution minor delta, acceptable for now, fix in Phase 5A.

### Still Pending ❌
- Phase 1A: Claude as primary AI in chat route
- Phase 1B: Maple system prompt Aeroplan context
- Phase 1C: Transfer Partners panel on /aeroplan page
- Phase 4A: FlightSearchForm component
- Phase 4B: ResultsComparisonCard + ValueBadge components
- Phase 4C: /travel page + sidebar nav update
- Phase 5A: Verification + TypeScript clean pass
- Phase 5B: iOS Capacitor sync

### Known Issues / Decisions Made
- `zone` field in airports response returns string (e.g. "canada") not integer — this is handled in flight-search via `getZonePairId()`. Do not change airport route.
- Duffel test token is in `.env.local`. Flip to live token before production.
- `award_search_cache` table created and verified in Supabase Mar 5, 2026.
- 405 error was caused by incorrect export — fixed by using `export async function POST`.

---

## Part 10 — Sprint 11 Detail (Email + Deal Alerts)

**Duration:** 2 days · **Gate:** Expiry alerts = Plus+ · Deal feed = all users

### New Packages
```bash
pnpm add resend react-email @react-email/components rss-parser
```

### New Env Vars Needed
```bash
RESEND_API_KEY=
CRON_SECRET=        # openssl rand -hex 32
ADMIN_EMAIL=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

### Files to Create
```
src/lib/email.ts
src/emails/welcome.tsx
src/emails/expiry-warning.tsx
src/emails/transfer-bonus-alert.tsx
src/emails/weekly-digest.tsx
src/app/api/cron/expiry-alerts/route.ts
src/app/api/cron/fetch-alerts/route.ts
src/app/api/cron/weekly-digest/route.ts
src/app/(dashboard)/alerts/page.tsx
src/components/alerts/alert-feed.tsx
src/components/alerts/alert-type-badge.tsx
```

### vercel.json crons (create or update)
```json
{
  "crons": [
    { "path": "/api/cron/expiry-alerts", "schedule": "0 9 * * 1" },
    { "path": "/api/cron/fetch-alerts",  "schedule": "0 * * * *" },
    { "path": "/api/cron/weekly-digest", "schedule": "0 8 * * 2" }
  ]
}
```

### RSS Feed Sources (hardcoded, trust scores matter for UI sorting)
```typescript
const FEEDS = [
  { name: "Prince of Travel",   url: "https://princeoftravel.com/feed/",      trust: 5 },
  { name: "Milesopedia",        url: "https://www.milesopedia.com/feed/",     trust: 5 },
  { name: "Reward Plane CA",    url: "https://rewardplaneca.com/feed/",       trust: 4 },
  { name: "Credit Card Genius", url: "https://creditcardgenius.ca/blog/feed", trust: 4 },
  { name: "Maple Miles",        url: "https://maplemiles.ca/feed/",           trust: 4 },
];
```

### Alert Type Classification
Keywords that trigger classification:
- `transfer_bonus`: "transfer bonus", "bonus miles", "double miles"
- `flash_sale`: "flash sale", "limited time", "48 hours"
- `increased_offer`: "best ever offer", "increased offer", "record high"
- `devaluation`: "devaluation", "award chart change", "points worth less"
- `promo`: "promo", "promotion", "earn more"

### DB Migration Required (run before coding)
See Part 4 — "Tables to Add Sprint 11"

### Verification Steps
1. `GET /alerts` — renders deal feed with type badges
2. Manually POST to `/api/cron/expiry-alerts` with `Authorization: Bearer {CRON_SECRET}` — confirm email sent to ADMIN_EMAIL
3. Welcome email fires on new test account creation

---

## Part 11 — Sprint 12 Detail (Live Availability)

**Duration:** 3 days · **Gate:** Pro  
**Business gate:** Do NOT start until 10 active Pro subscribers confirmed. Seats.aero costs $49 USD/mo.

### New Packages
None (use native fetch for Seats.aero — it has no SDK)

### New Env Vars
```bash
SEATS_AERO_API_KEY=     # seats.aero/api
```

### Key Design Decisions
- Seats.aero called with `source: "aeroplan"` — only Aeroplan partner award space
- Cache availability data 6 hours (vs 4 hours for cash prices)
- Calendar UI: green = 3+ seats, yellow = 1-2 seats, grey = none, black = past date
- Clicking a calendar date triggers full flight-search for that exact date
- Saved searches stored in `user_saved_searches` table (see Part 4)
- Daily cron checks saved searches and emails on new availability

### Files to Create
```
src/lib/travel/seats-aero.ts
src/app/api/travel/availability/route.ts
src/app/api/travel/saved-searches/route.ts
src/app/api/cron/check-saved-searches/route.ts
src/components/travel/availability-calendar.tsx
src/components/travel/saved-search-button.tsx
```

### API Response Shape — Availability Calendar
```typescript
{
  calendar: {
    "2026-06-15": { available: true,  seats: 2, milesCost: 65000, partners: ["LH", "LX"] },
    "2026-06-16": { available: false, seats: 0, milesCost: null,   partners: [] },
  }
}
```

### vercel.json — Add This Cron
```json
{ "path": "/api/cron/check-saved-searches", "schedule": "0 7 * * *" }
```

---

## Part 12 — Sprint 13 Detail (French + Hotels)

**Duration:** 3 days · **French:** All users · **Hotels:** Pro gate

### New Packages
```bash
pnpm add next-intl
```

### Translation Files
- `messages/en.json` — all existing UI strings formalized
- `messages/fr.json` — Canadian French (tu form, not vous, not European French)

### French Rules for Translations
- "Épicerie" not "Courses"
- "Carte de crédit" not "Carte"
- "Récompenses" not "Points" generically
- Province QC → default locale to 'fr' during onboarding
- Maple responds in French when `userLocale === 'fr'`

### System Prompt Addition (French)
```typescript
const langInstruction = userLocale === "fr"
  ? "IMPORTANT: Réponds toujours en français canadien (pas français européen). Utilise le tutoiement."
  : "Respond in English. If the user writes in French, respond in French.";
```

### Hotel Programs to Seed (manual research from official award charts before coding)
| Program | Slug | Points Range/Night | Canadian Card Partners |
|---|---|---|---|
| Marriott Bonvoy | marriott | 7,500–100,000 | Amex MR (3:1) |
| Hilton Honors | hilton | 5,000–150,000 | None major |
| IHG One Rewards | ihg | 10,000–70,000 | None major |

### Files to Create
```
messages/en.json
messages/fr.json
src/i18n.ts
src/components/language-switcher.tsx
src/scripts/seed-hotels.ts
src/app/api/travel/hotels/route.ts
src/app/(dashboard)/travel/hotels/page.tsx
src/components/travel/hotel-search-form.tsx
src/components/travel/hotel-results-list.tsx
```

### Middleware Update
Add `next-intl` locale detection to existing Clerk middleware. Must not break existing auth protection.

---

## Part 13 — Sprint 14 Detail (Experts + WestJet + eUpgrades)

**Duration:** 2 days · **Expert Booking:** Pro gate · **WestJet/eUpgrades:** All users

### Expert Roster (hardcoded in src/data/experts.ts — not DB)
```typescript
export const EXPERTS = [
  {
    id: "expert-aeroplan",
    name: "Sarah Chen",
    title: "Aeroplan & Star Alliance Specialist",
    bio: "15+ years optimizing Aeroplan redemptions. Specializes in partner awards, eUpgrade strategy, and business class sweet spots.",
    specialties: ["Aeroplan", "Business Class", "eUpgrades", "Star Alliance routing"],
    calendlyUrl: "https://calendly.com/truenorthpoints-sarah/30min",
    sessionRateCad: 75,
    sessionMinutes: 30,
    rating: 4.9,
    reviewCount: 127,
    avatarInitials: "SC",
  },
  {
    id: "expert-multi",
    name: "Marc Beaupré",
    title: "Multi-Program Strategist (EN/FR)",
    bio: "Bilingual consultant based in Montréal. Expert in Scene+, PC Optimum, card stacking, and maximizing everyday Canadian spending.",
    specialties: ["Scene+", "PC Optimum", "Card Strategy", "French service"],
    calendlyUrl: "https://calendly.com/truenorthpoints-marc/30min",
    sessionRateCad: 65,
    sessionMinutes: 30,
    rating: 4.8,
    reviewCount: 89,
    avatarInitials: "MB",
  },
];
```

### WestJet Module Rules
- Read WestJet Dollars balance from `user_loyalty_accounts` where `program = 'westjet'`
- WestJet Dollars = dollar-for-dollar redemption (no award chart needed)
- Deep link template: `https://www.westjet.com/en-ca/plan-trip/vacation-packages?dep={depCity}`
- Companion voucher info for World Elite Mastercard holders
- No external API — static component + loyalty DB read only

### eUpgrade Tracker Rules
- Data from `user_eupgrade_certificates` table (see Part 4)
- Static guide content (do not fetch externally):
  - Domestic routes = highest clearance success rate
  - Best window: exactly 24h before departure
  - Jan–Mar = best months for transatlantic eUpgrade clearance
  - Status required: Prestige (25K) minimum, higher = better odds

### Files to Create
```
src/data/experts.ts
src/app/(dashboard)/experts/page.tsx
src/components/experts/expert-card.tsx
src/components/experts/booking-dialog.tsx
src/app/(dashboard)/travel/eupgrades/page.tsx
src/components/travel/eupgrade-tracker.tsx
src/components/travel/westjet-module.tsx
```

---

## Part 14 — Aeroplan Data Reference (Sprint 9 — Verified)

### Zone Pair IDs (used in getZonePairId())
The airport-zones.ts file maps IATA codes to zone strings. The award chart uses these zone pair IDs:

| Origin Zone | Destination Zone | Pair ID | Economy | Business | First |
|---|---|---|---|---|---|
| canada | canada | canada-canada | 6,000 | 15,000 | — |
| canada | zone2 | canada-zone2 | 12,500 | 35,000 | — |
| canada | europe | canada-europe | 35,000 | 65,000 | 100,000 |
| canada | asia-ne | canada-asia-ne | 40,000 | 75,000 | 110,000 |
| canada | asia-se | canada-asia-se | 45,000 | 85,000 | 120,000 |

### 12 Sweet Spots (from aeroplan-sweet-spots.json)
1. YYZ/YVR → London (Lufthansa/SWISS) Business: 65,000 miles, 6.9¢/mi, EXCEPTIONAL
2. YVR → Tokyo (ANA) Business: 75,000 miles, 10.7¢/mi, EXCEPTIONAL
3. YYZ → Paris (Air France) Business: 65,000 miles, 6.5¢/mi, EXCEPTIONAL
4. Any Canada → Hawaii Economy: 12,500 miles, 4.4¢/mi, GREAT
5. Mini RTW (Star Alliance, up to 3 stops): 12.5¢/mi avg, EXCEPTIONAL
6. Canadian domestic short-haul Economy: 6,000 miles, 3.0¢/mi, GREAT
7. YYZ → Singapore (SQ/LH) Business: 85,000 miles, 8.8¢/mi, EXCEPTIONAL
8. YYZ → Hong Kong (Cathay) Business: 75,000 miles, 7.2¢/mi, EXCEPTIONAL
9. Any → Caribbean Economy: 12,500 miles, 4.0¢/mi, GREAT
10. YYZ → Dubai (Emirates via Star partner) Business: 75,000 miles, 6.8¢/mi, EXCEPTIONAL
11. Canada → Mexico/Central America Economy: 12,500 miles, 3.8¢/mi, GREAT
12. Swiss First Class TATL: 100,000 miles, 13.3¢/mi, EXCEPTIONAL (rare availability)

### Fuel Surcharge Rule (Always Include in Maple Context)
Book non-Air Canada operated transatlantic flights to avoid YQ surcharges ($500–$900 CAD). Best partners with no/low surcharges: Lufthansa, SWISS, Air France, ANA, Ethiopian.

---

## Part 15 — CPM Value Tiers (calculations.ts)

| Tier | CPM Threshold | Tailwind Color | Emoji | Action |
|---|---|---|---|---|
| Exceptional | ≥ 6.0¢ | text-green-600, bg-green-100 | 🟢 | Always use miles |
| Great | ≥ 3.0¢ | text-lime-600, bg-lime-100 | 🟡 | Recommended |
| Good | ≥ 2.0¢ | text-amber-500, bg-amber-100 | 🟠 | Situational |
| Poor | ≥ 1.0¢ | text-red-500, bg-red-100 | 🔴 | Save miles |
| Terrible | < 1.0¢ | text-red-900, bg-red-200 | ⛔ | Always pay cash |

**Baseline Aeroplan value: 1.5¢/mile** (what Aeroplan claims). Anything above 3¢ is objectively better than earning cash back.

---

## Part 16 — Transfer Partners (Aeroplan)

| Card Currency | Transfer Ratio | Transfer Time | Notes |
|---|---|---|---|
| Amex MR (mr) | 1:1 | 1–3 business days | Minimum 1,000 MR |
| TD Points (td-points) | 1:1 | Instant | TD Aeroplan cards only |
| RBC Avion (rbc-avion) | 1:1 | 1–2 business days | |
| CIBC Aventura (cibc-aventura) | 1:1 | 1–2 business days | |

**In calcShortfall():** Only these 4 currencies count as transferable. Filter `transferableCards` by currency IN ['mr', 'td-points', 'rbc-avion', 'cibc-aventura'].

---

## Part 17 — Coding Patterns (Strictly Follow)

### Supabase Query Pattern (Server Components / API Routes)
```typescript
// Always use supabaseAdmin for server-side. Never use the browser client in API routes.
import { supabaseAdmin } from "@/lib/supabase/admin";

const { data, error } = await supabaseAdmin
  .from("table_name")
  .select("column1, column2")
  .eq("clerkId", userId)
  .single();

if (error || !data) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```

### Auth Pattern (API Routes)
```typescript
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... rest of handler
}
```

### Error Response Pattern
```typescript
// Always include error key, optional upgrade key for paywall hits
return NextResponse.json({ error: "Message here" }, { status: 400 });
return NextResponse.json({ error: "Pro subscription required", upgrade: true }, { status: 403 });
```

### Cache Pattern (award_search_cache)
```typescript
// Check cache
const cacheKey = `${origin}-${destination}-${date}-${cabin}`;
const { data: cached } = await supabaseAdmin
  .from("award_search_cache")
  .select("result_json")
  .eq("cache_key", cacheKey)
  .gt("expires_at", new Date().toISOString())
  .maybeSingle();
if (cached) return NextResponse.json(cached.result_json);

// Write cache (after building result)
await supabaseAdmin.from("award_search_cache").upsert({
  cache_key: cacheKey,
  result_json: result,
  expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
}, { onConflict: "cache_key" });
```

### Component Pattern
```typescript
// Client components: "use client" at top
// Server components: no directive (default)
// shadcn imports: from "@/components/ui/..."
// lucide imports: import { IconName } from "lucide-react"
// Never use inline styles — always Tailwind classes
// Never use <form> — use onClick handlers
```

### Nav Update Pattern
When adding a new nav item, find `src/components/layout/dashboard-layout.tsx` and add to the nav array in the same format as existing items. Always use a Lucide icon. Add a `badge` prop for Pro-gated items.

---

## Part 18 — Anti-Deviation Rules

These are the most common ways AI deviates. Actively avoid all of these.

| ❌ Deviation | ✅ Correct Behaviour |
|---|---|
| Installing axios, node-fetch | Use native `fetch()` |
| Using `export default` in API routes | Use `export async function GET/POST` |
| Creating files in `src/pages/api/` | Always use `src/app/api/` (App Router) |
| Using `useEffect` to fetch data in server components | Use async server components or Route Handlers |
| Hardcoding API keys | Always use `process.env.VAR_NAME` |
| Creating a new Supabase table without the exact SQL from this doc | Run the exact SQL from Part 4 |
| Using `npm` or `yarn` | Always use `pnpm` |
| Adding a feature to a completed sprint's files beyond the fix needed | Create new files for new features |
| Skipping the Pro/Plus gate | Always implement server-side subscription check first |
| Using numeric zone IDs when string zone IDs are established | Use `getZonePairId()` with string zones |
| Changing the airports route zone format | Leave as string ("canada") — flight-search handles mapping |
| Using Amadeus API | Amadeus is shut down — Duffel only |
| Using `any` type in TypeScript | Define proper interfaces for all data shapes |
| Skipping `git push` at end of phase | Always commit + push at end of each phase |

---

## Part 19 — Commit Message Convention

```
Sprint X Phase Y: brief description

Examples:
Sprint 10 Phase 1A: switch Claude to primary AI provider
Sprint 10 Phase 2A: add Duffel API client
Sprint 10 Phase 4C: travel hub page + sidebar nav update
fix: airports route POST export signature
fix: award_search_cache upsert conflict key
chore: remove test route before production
```

---

## Part 20 — Phase Verification Checklist Template

Copy this for each phase. All items must be ✅ before committing.

```
Phase X Verification:
[ ] File(s) created at correct path (not pages router, not wrong folder)
[ ] TypeScript compiles: npx tsc --noEmit reports 0 errors
[ ] Export signatures correct (named exports in API routes)
[ ] Environment variables accessed via process.env (not hardcoded)
[ ] Supabase column names verified against src/db/schema.ts
[ ] Subscription gate implemented server-side (if applicable)
[ ] No packages installed that aren't in the approved list
[ ] No files from previous sprints modified (unless explicitly required)
[ ] git add -A && git commit && git push completed
[ ] Live URL test performed (if API route)
```

---

## Part 21 — iOS Capacitor Rules

- The iOS app is a WebView that loads `https://truenorthpoints.ca`
- All feature changes are automatically reflected after `git push` (no App Store update needed)
- Only run `pnpm cap:sync` after a successful `pnpm build`
- Only needed when: native plugins added, app icons/splash changed, capacitor.config.ts changed
- The `pnpm build` must pass with zero errors before cap:sync

---

## Part 22 — Decision Log (Locked Decisions — Do Not Revisit)

| Decision | Rationale | Date |
|---|---|---|
| Duffel API replaces Amadeus | Amadeus self-service shut down Feb 9, 2026 | Mar 2, 2026 |
| Claude as primary AI, GPT-4o as fallback | Better Canadian card + Aeroplan reasoning | Mar 5, 2026 |
| Zone IDs as strings not integers | `getZonePairId()` already implemented this way in Sprint 9 | Mar 5, 2026 |
| 4-hour cache TTL for flight search | Balance freshness vs. Duffel API costs | Mar 5, 2026 |
| 6-hour cache TTL for availability | Seats.aero data changes less frequently | Design decision |
| Travelpayouts as affiliate layer | Turns cash comparison into revenue | Mar 2, 2026 |
| Seats.aero gated behind 10 Pro subscribers | $49/mo cost must be justified before activating | Mar 2, 2026 |
| Calendly for expert bookings | No custom booking system needed at MVP scale | Mar 2, 2026 |
| Canadian French (tu form) for FR locale | Quebec market prefers tu over vous | Mar 2, 2026 |
| hotel_programs seeded manually (not via API) | No reliable hotel data API at this price point | Mar 2, 2026 |

---

*TrueNorthPoints.ca · Antigravity Master Brain · v2.0 · March 5, 2026*  
*This document supersedes all previous sprint plans. When in conflict, this document wins.*  
*Update this document after each sprint completion.*