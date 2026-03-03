# 🍁 TrueNorthPoints.ca — Gap Analysis Report
> **Compared Against:** 5-Day MVP Plan · Feature 4 Travel Planner Spec · SaveSage Canada Blueprint  
> **Current App Version:** 0.1.0 · 22 commits · 6 sprints  
> **Report Date:** March 2, 2026

---

## Executive Summary

The app has completed a solid **Core MVP (Phase 1)** covering authentication, card wallet, spending profile, recommendations engine, and the Maple AI chat. The team exceeded some original targets (35 cards vs. 15 planned, iOS Capacitor app was a bonus, AI failover with GPT-4o + Gemini).

However, **three major feature pillars are entirely unbuilt**, and **two critical monetization components** are missing. The app is currently a free tool with no revenue mechanism.

| Pillar | Planned | Built | Status |
|---|---|---|---|
| Core MVP (Auth, Wallet, Chat, Recs) | ✅ | ✅ | **Complete** |
| Points Tracking & Alerts | ✅ | ❌ | **Not started** |
| Loyalty Programs (non-card) | ✅ | ❌ | **Not started** |
| Travel on Points Planner | ✅ | ❌ | **Not started** |
| Flash Sale Alert System | ✅ | ❌ | **Not started** |
| Monetization (Stripe) | ✅ | ❌ | **Not started** |
| Human Expert Consultations | ✅ | ❌ | **Not started** |
| French / Bilingual Support | ✅ | ❌ | **Not started** |

---

## Section 1 — What's Built (Confirmed ✅)

| Feature | Plan Reference | Notes |
|---|---|---|
| Landing page | 5-Day Plan Day 1 | Exceeds plan — glassmorphism, animated CTAs |
| Email + social login (Clerk) | 5-Day Plan Day 1 | ✅ All login options complete |
| Clerk webhook → Supabase sync | 5-Day Plan Day 1 | ✅ Svix verification included |
| Route protection middleware | 5-Day Plan Day 1 | ✅ `/dashboard`, `/wallet`, `/chat` protected |
| Supabase PostgreSQL database | 5-Day Plan Day 2 | ✅ 4 core tables live |
| 3-step onboarding wizard | 5-Day Plan Day 2 | ✅ Cards → Spending → Recommendations |
| Canadian card catalog | 5-Day Plan Day 3 | ✅ **35 cards** (plan targeted 15) |
| Card wallet CRUD | 5-Day Plan Day 3 | ✅ Add/edit/delete + points balance |
| Spending profile (8 categories) | 5-Day Plan Day 3 | ✅ Sliders, upsert pattern |
| Best card recommender | 5-Day Plan Day 3 | ✅ Per-category + annual value calc |
| Missed value alert | Blueprint | ✅ Gap between current vs. optimal wallet |
| Maple AI chat (streaming) | 5-Day Plan Day 5 | ✅ GPT-4o primary, Gemini fallback |
| Context-aware system prompt | 5-Day Plan Day 5 | ✅ User's cards + spending injected |
| Chat history persistence | 5-Day Plan Day 5 | ✅ Last 50 messages |
| Suggested prompt chips | 5-Day Plan Day 5 | ✅ 6 quick-start prompts |
| PWA (manifest + service worker) | Bonus — not in plan | ✅ Offline capable, iOS web app |
| iOS Capacitor native app | Bonus — not in plan | ✅ Xcode project, ca.truenorthpoints.app |
| Vercel production deploy | 5-Day Plan Day 1 | ✅ truenorthpoints.ca |
| Dashboard stats overview | 5-Day Plan Day 3 | ✅ Server-side rendered |

---

## Section 2 — What's Pending (Full Breakdown)

---

### 🔴 PENDING — Monetization (Stripe Subscriptions)

**Priority: CRITICAL — App has no revenue mechanism**

Referenced in: *5-Day Plan (Week 2 Priorities)*, *SaveSage Canada Blueprint Section 4.2*

The original plan defined three subscription tiers:

| Tier | Price | Features |
|---|---|---|
| Free | $0 | 3 cards, 5 AI queries/day, basic recs |
| Plus | $9.99 CAD/mo | Unlimited cards, unlimited chat, expiry alerts |
| Pro | $24.99 CAD/mo | Everything + expert consultations, travel planner |

**What needs to be built:**

```
src/
├── app/
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts        ← Create Stripe checkout session
│   │   │   ├── portal/route.ts          ← Customer billing portal
│   │   │   └── webhooks/route.ts        ← Handle subscription events
│   │   └── subscription/route.ts        ← Get user's current plan
│   └── (dashboard)/
│       ├── billing/page.tsx             ← Subscription management page
│       └── upgrade/page.tsx             ← Upgrade CTA page
├── lib/
│   └── stripe.ts                        ← Stripe client + price IDs
└── components/
    ├── upgrade-banner.tsx               ← Shows when free user hits limit
    └── subscription-badge.tsx           ← Shows plan in nav
```

**Feature gates to add to existing routes:**

```typescript
// /api/chat — enforce free tier limit
// Current: no limits
// Needs: check subscription_tier, count today's messages, return 429 if exceeded

// /api/recommendations — gate "Cards You Don't Have" behind Plus
// /api/travel/* — gate entire travel planner behind Pro
```

**Packages needed:**
```bash
pnpm add stripe @stripe/stripe-js
```

**New env vars:**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PLUS_MONTHLY=
STRIPE_PRICE_PRO_MONTHLY=
```

---

### 🔴 PENDING — Email System (Resend)

**Priority: HIGH — Powers alerts, onboarding, and weekly digest**

Referenced in: *5-Day Plan Day 4*, *SaveSage Canada Blueprint*

Currently: No email integration exists. No env var for Resend.

**What needs to be built:**

```
src/
├── app/api/
│   ├── cron/
│   │   ├── expiry-alerts/route.ts       ← Weekly: warn about expiring points
│   │   ├── weekly-digest/route.ts       ← Weekly: best deal summary email
│   │   └── fetch-alerts/route.ts        ← Hourly: RSS + Reddit deal scraper
│   └── alerts/
│       └── preferences/route.ts         ← User alert opt-in/out settings
├── emails/
│   ├── expiry-warning.tsx               ← React Email template
│   ├── weekly-digest.tsx                ← React Email template
│   ├── transfer-bonus-alert.tsx         ← React Email template
│   └── welcome.tsx                      ← React Email template
└── lib/
    └── email.ts                         ← Resend client
```

**Vercel cron config needed (vercel.json):**
```json
{
  "crons": [
    { "path": "/api/cron/expiry-alerts",  "schedule": "0 9 * * 1" },
    { "path": "/api/cron/weekly-digest",  "schedule": "0 8 * * 2" },
    { "path": "/api/cron/fetch-alerts",   "schedule": "0 * * * *" }
  ]
}
```

**Packages needed:**
```bash
pnpm add resend react-email @react-email/components
```

**New env vars:**
```
RESEND_API_KEY=
CRON_SECRET=
ADMIN_EMAIL=
```

---

### 🔴 PENDING — Points History & Expiry Tracking

**Priority: HIGH — Core retention feature**

Referenced in: *5-Day Plan Day 4 Steps 4.4–4.6*

Currently: The `user_cards` table stores `pointsExpiry` and `pointsBalance` but there is no history table and no expiry warning UI beyond what's in the dashboard.

**Missing database tables:**

```sql
-- Run in Supabase SQL Editor

CREATE TABLE points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_card_slug TEXT NOT NULL,
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  change_type TEXT CHECK (change_type IN ('manual', 'earned', 'redeemed', 'expired', 'transfer')),
  note TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_history_user ON points_history(user_id, recorded_at DESC);
```

**What needs to be built:**

```
src/
├── app/(dashboard)/
│   └── points-history/page.tsx          ← Chart of balance over time
├── app/api/
│   └── user/cards/[id]/route.ts         ← PATCH: log to history on balance change
├── components/
│   ├── points-history-chart.tsx         ← Line chart (recharts) per card
│   └── expiry-warning-banner.tsx        ← Prominent dashboard alert
```

**Enhancement to existing PATCH /api/cards:** Currently updates balance with no audit trail. Needs to write a row to `points_history` whenever balance changes.

---

### 🟠 PENDING — Loyalty Program Accounts (Non-Card)

**Priority: HIGH — Core to the SaveSage Canada concept**

Referenced in: *SaveSage Canada Blueprint Section 3.3*, *5-Day Plan Day 2 Schema*

Currently: The app tracks loyalty programs only through the card's `rewardCurrency` field. There is **no way for users to track their standalone Aeroplan balance, Air Miles account, PC Optimum balance, etc.** separately from their credit cards.

**Missing database table:**

```sql
CREATE TABLE user_loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program TEXT NOT NULL CHECK (program IN (
    'aeroplan', 'air-miles', 'westjet', 'scene', 
    'pc-optimum', 'triangle', 'starbucks', 'marriott', 'hilton'
  )),
  account_number TEXT,
  current_balance INTEGER DEFAULT 0,
  status_tier TEXT,
  points_expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**What needs to be built:**

```
src/
├── app/(dashboard)/
│   └── loyalty/page.tsx                 ← Loyalty programs hub
├── components/loyalty/
│   ├── loyalty-accounts-list.tsx        ← List all tracked programs
│   ├── add-loyalty-dialog.tsx           ← Add program + balance
│   ├── aeroplan-card.tsx                ← Aeroplan status + balance widget
│   ├── air-miles-card.tsx               ← Dream vs Cash miles breakdown
│   └── pc-optimum-card.tsx              ← 10,000 pts = $10 value display
└── app/api/
    └── loyalty-accounts/route.ts        ← CRUD for loyalty accounts
```

**Why this matters:** Maple currently can't answer "How many Aeroplan miles do I have total?" because it only sees card-linked balances, not the user's actual Aeroplan account balance. This is a fundamental gap.

---

### 🟠 PENDING — Aeroplan Deep Dive Page

**Priority: HIGH — Signature Canadian feature**

Referenced in: *5-Day Plan Day 4 Step 4.3*, *Feature 4 Spec Section 2.3*, *Blueprint Section 3.3*

Currently: No Aeroplan-specific page exists. The chatbot mentions Aeroplan but there's no dedicated tracker or guide.

**What needs to be built:**

```
src/
├── app/(dashboard)/
│   └── aeroplan/page.tsx                ← Aeroplan hub
├── data/
│   ├── aeroplan-award-chart.ts          ← Zone-based miles cost table
│   ├── aeroplan-zones.ts                ← Airport → zone mapping (200+ airports)
│   └── aeroplan-sweet-spots.json        ← Curated top redemptions
├── components/aeroplan/
│   ├── sweet-spots-grid.tsx             ← Cards for top-value routes
│   ├── zone-calculator.tsx              ← Input airports → shows zone + cost
│   └── status-tracker.tsx              ← 25K/35K/50K/75K progress bar
```

**Sweet spots data to author (8–10 entries minimum):**

| Route | Cabin | Miles | Cash Value | CPM |
|---|---|---|---|---|
| YYZ / YVR → LHR (Lufthansa) | Business | 65,000 | ~$4,500 | 6.9¢ |
| YVR → NRT (ANA) | Business | 75,000 | ~$6,000 | 8.0¢ |
| YYZ → CDG (Air France) | Business | 65,000 | ~$4,200 | 6.5¢ |
| Any → HNL (Hawaii) | Economy | 12,500 | ~$500 | 4.0¢ |
| Domestic short-haul | Economy | 6,000 | ~$200 | 3.3¢ |

---

### 🔴 PENDING — Feature 4: Travel on Points Planner

**Priority: HIGH (Pro feature / key differentiator)**

Referenced in: *Feature 4 Spec — entire document (11 sections)*

This entire feature is unbuilt. It is the most complex and the most compelling Pro-tier feature.

**Sub-features breakdown:**

#### 4a. Flight Award Calculator (Static — no paid API)
*Buildable immediately with no new API costs*

```
src/
├── app/(dashboard)/
│   └── travel/page.tsx                  ← Travel planner hub
├── app/api/travel/
│   └── flight-search/route.ts           ← Calculator using award chart
├── components/travel/
│   ├── flight-search-form.tsx           ← Origin/destination/cabin/date inputs
│   ├── results-comparison-card.tsx      ← Points vs. cash side-by-side
│   ├── shortfall-calculator.tsx         ← "You need X more miles"
│   └── earning-strategy.tsx             ← Which card earns fastest
```

This version uses your `aeroplan-award-chart.ts` data file (static) + Amadeus free tier for cash prices. **No Seats.aero needed at this stage.** Delivers core value: "YYZ to London business costs 65,000 miles, cash is $4,800, that's 7.4¢ per mile — exceptional value."

#### 4b. Live Award Availability Calendar (Seats.aero API)
*Requires $49 USD/mo Seats.aero subscription*

```
src/
├── app/api/travel/
│   ├── availability/route.ts            ← Seats.aero proxy + caching
│   └── airports/route.ts               ← Amadeus airport autocomplete
├── lib/travel/
│   ├── seats-aero.ts                   ← API client
│   └── calculations.ts                 ← CPM, value rating engine
├── components/travel/
│   └── availability-calendar.tsx       ← Green/yellow/grey date picker
└── db/
    └── award-search-cache table        ← 6-hour TTL cache (Supabase)
```

#### 4c. Hotel Awards Module

```
src/
├── data/
│   └── hotel-award-rates.json          ← Marriott/Hilton/IHG categories
├── components/travel/
│   └── hotel-award-search.tsx          ← City + program → points cost
└── app/api/travel/
    └── hotels/route.ts
```

#### 4d. eUpgrade Certificate Tracker

```
src/
├── app/(dashboard)/
│   └── travel/eupgrades/page.tsx
├── components/travel/
│   └── eupgrade-tracker.tsx            ← Quantity, expiry, target routes
└── app/api/
    └── eupgrades/route.ts              ← CRUD
```

#### 4e. WestJet Vacations Module

```
src/
├── components/travel/
│   └── westjet-module.tsx              ← Balance → deep link to WestJet
└── data/
    └── westjet-guide.ts               ← Static redemption guide content
```

**New env vars for Travel Planner:**
```
SEATS_AERO_API_KEY=           ← Phase 2 only
AMADEUS_API_KEY=              ← Free tier, start immediately
AMADEUS_API_SECRET=           ← Free tier, start immediately
AMADEUS_ENV=test
```

---

### 🟠 PENDING — Flash Sale & Deal Alert System

**Priority: MEDIUM (Pro feature, drives retention)**

Referenced in: *Feature 4 Spec Section 2.5–2.6 and Section 9*

Currently: No alert system, no monitoring infrastructure.

**What needs to be built:**

```
src/
├── app/api/cron/
│   └── fetch-alerts/route.ts           ← Hourly: RSS + Reddit + Aeroplan.com
├── lib/alerts/
│   ├── rss-monitor.ts                  ← Parse 5 Canadian points blogs
│   ├── reddit-monitor.ts               ← r/aeroplan, r/PersonalFinanceCanada
│   └── aeroplan-news-scraper.ts        ← Playwright scraper for aeroplan.com
├── app/(dashboard)/
│   └── alerts/page.tsx                 ← Deal alert feed UI
└── components/alerts/
    ├── alert-feed.tsx                  ← Live list of active deals
    └── alert-badge.tsx                 ← "NEW" badge in sidebar nav
```

**New database table:**

```sql
CREATE TABLE deal_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  keywords TEXT[],
  alert_type TEXT CHECK (alert_type IN (
    'transfer_bonus','flash_sale','increased_offer','devaluation','promo'
  )),
  programs_affected TEXT[],
  trust_score INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Packages needed:**
```bash
pnpm add rss-parser playwright
pnpm playwright install chromium
```

**New env vars:**
```
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

---

### 🟡 PENDING — Human Expert Consultations

**Priority: MEDIUM (Pro tier monetization)**

Referenced in: *SaveSage Canada Blueprint Section 3.4 Feature 6*

Currently: Not built. In SaveSage this is a key differentiator for the Elite/Private tiers.

**What needs to be built:**

```
src/
├── app/(dashboard)/
│   └── experts/page.tsx                ← Expert roster + booking
├── components/experts/
│   ├── expert-card.tsx                 ← Expert profile (photo, bio, specialty)
│   └── booking-dialog.tsx             ← Calendly embed or custom scheduler
└── app/api/
    └── consultations/route.ts          ← Log booked sessions
```

**Recommended approach for MVP:** Embed **Calendly** links for each expert. No custom scheduling infrastructure needed. Experts are vetted through an application process you run manually at first.

---

### 🟡 PENDING — Card Terms Change Monitoring (Scraper)

**Priority: MEDIUM — Data quality & trust**

Referenced in: *5-Day Plan (Week 2 Priorities)*, *Feature 4 Spec Section 5*

Currently: No scraping infrastructure. Card rates are static and there's no automated mechanism to detect when a bank changes their earn rates.

**What needs to be built:**

```
src/
├── app/api/cron/
│   └── verify-card-rates/route.ts      ← Weekly: Playwright + hash diff
├── lib/
│   └── card-monitor.ts                 ← Scrape + compare + alert admin
└── db/
    └── content_hash column on card_catalog ← Add via Drizzle migration
```

---

### 🟡 PENDING — French Language (Bilingual) Support

**Priority: MEDIUM — Required to access Quebec market (~25% of Canada)**

Referenced in: *SaveSage Canada Blueprint Section 3.1*, *5-Day Plan Stack Summary*

Currently: The Maple chatbot already responds in French if prompted (noted in report), but the entire UI is English-only.

**What needs to be built:**

```
src/
├── i18n/
│   ├── en.json                         ← English strings
│   └── fr.json                         ← French translations
├── lib/
│   └── i18n.ts                         ← i18n helper
└── components/
    └── language-switcher.tsx           ← EN/FR toggle in nav
```

**Package needed:**
```bash
pnpm add next-intl
```

---

### 🟡 PENDING — Saved Flight Searches & Availability Alerts

**Priority: MEDIUM (Pro feature)**

Referenced in: *Feature 4 Spec Section 3 — user_saved_searches table*

Currently: No saved search functionality.

**What needs to be built:**

```
src/
├── app/api/travel/
│   └── saved-searches/route.ts         ← CRUD for saved searches
├── components/travel/
│   └── saved-searches-list.tsx         ← Manage alerts
└── app/api/cron/
    └── check-saved-searches/route.ts   ← Daily: check Seats.aero for matches
```

---

## Section 3 — Deviations from Original Plan

These are things the app does **differently** from what was originally specified — some are improvements, some need attention.

| Item | Plan | Current App | Verdict |
|---|---|---|---|
| **App name** | PointsNorth | TrueNorthPoints.ca | ✅ Better domain |
| **AI provider** | Claude API (primary) | GPT-4o (primary), Gemini (fallback), Claude (configured but inactive) | ⚠️ Switch Claude to primary — it's already paid for and performs better on Canadian card math |
| **Card count** | 15 at launch | 35 at launch | ✅ Exceeds target |
| **iOS app** | Not planned for MVP | Capacitor iOS app built | ✅ Bonus delivery |
| **Drizzle ORM** | Recommended in plan | ✅ In use | ✅ Match |
| **React Query** | Recommended in plan | ❌ Not in use (Zustand only) | Minor — add if data-fetching complexity grows |
| **Next.js version** | 14 | **16** | ✅ Newer is better |
| **Tailwind version** | CSS v3 | **v4** | ✅ Newer is better |
| **Points expiry field** | `points_expiry_date` on `user_cards` | `pointsExpiry` ✅ exists | ✅ Present but no alert logic yet |
| **Province field on users** | Required for recommendations | `province` field exists in schema | ✅ Present, not yet used in recs |
| **Drugstore category** | Planned as a spend category | ❌ Not in spending profile | Add as 9th category |
| **Streaming earn rate** | In card catalog | ✅ Present | ✅ Match |

---

## Section 4 — Prioritized Build Queue

Recommended order based on revenue impact and user value:

### Sprint 7 — Monetization (Do This First)
*Estimated: 2–3 days*

1. Add Stripe subscriptions (Free / Plus $9.99 / Pro $24.99 CAD)
2. Gate AI chat at 5 queries/day for free tier
3. Add subscription badge to nav + upgrade banner
4. Billing portal page

**Why first:** Every feature you build from here should only be available on paid tiers. Build the gate before building more features.

---

### Sprint 8 — Points & Loyalty Tracking
*Estimated: 2 days*

1. Add `user_loyalty_accounts` table (Supabase migration)
2. Add `points_history` table (Supabase migration)
3. Build Loyalty Programs page (`/loyalty`)
4. Update card balance PATCH to write history rows
5. Add expiry warnings to dashboard (already has the data, needs UI)

---

### Sprint 9 — Aeroplan Deep Dive
*Estimated: 2 days*

1. Author `aeroplan-award-chart.ts` and `aeroplan-zones.ts` data files
2. Build Aeroplan page with sweet spots guide
3. Build zone calculator widget
4. Add Aeroplan balance to Maple's system prompt (from loyalty accounts)

---

### Sprint 10 — Travel Planner Phase 1 (No paid APIs)
*Estimated: 3–4 days*

1. Sign up for Amadeus free tier — get API keys
2. Build flight search form with airport autocomplete (Amadeus)
3. Build cash vs. points calculator (award chart + Amadeus cash price)
4. Build results comparison card with CPM value rating
5. Build shortfall calculator + earning strategy from user's cards
6. Gate behind Pro subscription

---

### Sprint 11 — Email & Alerts
*Estimated: 2 days*

1. Set up Resend, configure domain
2. Build expiry alert email (weekly cron)
3. Build welcome email (triggered on onboarding complete)
4. Build weekly digest (top deal of the week)
5. Set up RSS monitor for Prince of Travel + 4 other blogs
6. Set up Reddit API for r/aeroplan monitoring
7. Build deal alerts feed page

---

### Sprint 12 — Travel Planner Phase 2 (Live Availability)
*Estimated: 2–3 days · Requires Seats.aero $49/mo*

1. Subscribe to Seats.aero
2. Build `award_search_cache` table in Supabase
3. Build Seats.aero API client with caching
4. Replace static calculator with live availability calendar
5. Build saved flight search + alert system

---

### Sprint 13 — French Language & Hotels
*Estimated: 3 days*

1. Install `next-intl`, set up i18n routing
2. Create `en.json` and `fr.json` translation files
3. Add language switcher to nav
4. Seed hotel award categories (Marriott, Hilton, IHG)
5. Build hotel award calculator

---

### Sprint 14 — Expert Consultations + WestJet
*Estimated: 2 days*

1. Build experts roster page with Calendly embeds
2. Build WestJet Vacations module (balance tracker + deep link)
3. Build eUpgrade certificate tracker

---

## Section 5 — Quick Wins (< 4 hours each)

These can be done any time without disrupting other sprints:

| Task | Effort | Impact |
|---|---|---|
| Switch Maple to use **Claude** as primary (it's already configured) | 30 min | Better card math accuracy |
| Add **Drugstore** as 9th spending category | 2 hrs | Matches Shoppers Drug Mart use case |
| Add `content_hash` column to card catalog for change detection | 1 hr | Enables future scraper |
| Add province-specific tips to Maple system prompt | 1 hr | Better Quebec/Alberta recommendations |
| Add "Last verified" date badge on card catalog entries | 2 hrs | Builds user trust |
| Add Apple login to Clerk dashboard | 30 min | Needs Apple Dev account ($99/yr) |
| Seed `aeroplan-sweet-spots.json` (8–10 routes) | 3 hrs | Feeds Aeroplan page + Maple |

---

## Section 6 — Database Migrations Needed

Run these in Supabase SQL Editor in order:

```sql
-- Migration 001: Points history table
CREATE TABLE points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_slug TEXT NOT NULL,
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  change_type TEXT CHECK (change_type IN ('manual','earned','redeemed','expired','transfer')),
  note TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_points_history_user ON points_history(user_id, recorded_at DESC);

-- Migration 002: Loyalty accounts table
CREATE TABLE user_loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program TEXT NOT NULL,
  account_number TEXT,
  current_balance INTEGER DEFAULT 0,
  status_tier TEXT,
  points_expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program)
);
ALTER TABLE user_loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own loyalty accounts" ON user_loyalty_accounts
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE "clerkId" = current_setting('app.clerk_id', true)
  ));

-- Migration 003: Deal alerts table
CREATE TABLE deal_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  keywords TEXT[],
  alert_type TEXT CHECK (alert_type IN (
    'transfer_bonus','flash_sale','increased_offer','devaluation','promo'
  )),
  programs_affected TEXT[],
  trust_score INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deal_alerts_active ON deal_alerts(is_active, discovered_at DESC);

-- Migration 004: Award search cache (for Travel Planner Phase 2)
CREATE TABLE award_search_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  result_json JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_award_cache_key ON award_search_cache(cache_key);
CREATE INDEX idx_award_cache_expiry ON award_search_cache(expires_at);

-- Migration 005: Saved flight searches
CREATE TABLE user_saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  origin_airport CHAR(3),
  destination_airport CHAR(3),
  cabin TEXT,
  earliest_date DATE,
  latest_date DATE,
  alert_on_availability BOOLEAN DEFAULT true,
  alert_on_flash_sale BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved searches" ON user_saved_searches
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE "clerkId" = current_setting('app.clerk_id', true)
  ));

-- Migration 006: eUpgrade certificates
CREATE TABLE user_eupgrade_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE,
  status_tier TEXT,
  target_routes TEXT[],
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration 007: Add content_hash to card catalog for change monitoring
-- (Adjust table name to match your Drizzle schema)
ALTER TABLE card_catalog ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE card_catalog ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;
ALTER TABLE spending_profiles ADD COLUMN IF NOT EXISTS drugstore INTEGER DEFAULT 0;
```

---

## Section 7 — New Environment Variables Needed

Add to `.env.local` and Vercel Dashboard:

```bash
# ── MONETIZATION ────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PLUS_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...

# ── EMAIL ───────────────────────────────────────────────
RESEND_API_KEY=
CRON_SECRET=your-random-secret-min-32-chars
ADMIN_EMAIL=your@email.com

# ── TRAVEL PLANNER ──────────────────────────────────────
AMADEUS_API_KEY=               ← Free at developers.amadeus.com
AMADEUS_API_SECRET=
AMADEUS_ENV=test               ← Change to "production" after approval

SEATS_AERO_API_KEY=            ← Sprint 12 only — $49 USD/mo at seats.aero

# ── DEAL ALERTS ─────────────────────────────────────────
REDDIT_CLIENT_ID=              ← Free at reddit.com/prefs/apps
REDDIT_CLIENT_SECRET=

# ── EXISTING (already in .env.local) ────────────────────
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ✅
# CLERK_SECRET_KEY ✅
# CLERK_WEBHOOK_SECRET ✅
# DATABASE_URL ✅
# NEXT_PUBLIC_SUPABASE_URL ✅
# NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
# SUPABASE_SERVICE_ROLE_KEY ✅
# OPENAI_API_KEY ✅
# GEMINI_API_KEY ✅
# ANTHROPIC_API_KEY ✅ (switch to primary in /api/chat)
```

---

## Summary Scorecard

| Category | Features Planned | Features Built | % Complete |
|---|---|---|---|
| Core App (Auth, Nav, Onboarding) | 5 | 5 | **100%** |
| Card & Spending Management | 4 | 4 | **100%** |
| AI Recommendations & Chat | 3 | 3 | **100%** |
| Points & Loyalty Tracking | 4 | 0 | **0%** |
| Aeroplan Deep Dive | 3 | 0 | **0%** |
| Travel on Points Planner | 5 | 0 | **0%** |
| Flash Sale Alert System | 3 | 0 | **0%** |
| Monetization (Stripe) | 3 | 0 | **0%** |
| Email System | 4 | 0 | **0%** |
| Expert Consultations | 2 | 0 | **0%** |
| French Language | 1 | 0 | **0%** |
| **TOTAL** | **37** | **12** | **32%** |

---

*TrueNorthPoints.ca · Gap Analysis · March 2, 2026*  
*Generated by comparing project_report_md.resolved against:*  
*POINTSNORTH_5DAY_PLAN.md · FEATURE4_TRAVEL_PLANNER.md · SaveSage_Canada_Blueprint.docx*
