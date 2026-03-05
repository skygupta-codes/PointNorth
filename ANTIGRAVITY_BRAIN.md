# 🍁 TrueNorthPoints — Antigravity Master Brain
> **Version:** 3.0 · **Last Updated:** March 5, 2026  
> **Purpose:** Single source of truth for all development decisions. Read this before every prompt. Never deviate from this document without an explicit instruction from the project owner.  
> **Model:** Claude Opus 4.6 via Antigravity

---

## 🎯 NORTH STAR OBJECTIVE

**This is an iOS App first. The web site (truenorthpoints.ca) is the backend delivery mechanism — not the product.**

Every feature, every UI decision, every interaction pattern must be designed, tested, and validated as an iPhone experience before it is considered complete. If it works on web but feels wrong on iOS, it is not done.

**Target:** App Store launch on iPhone. Primary distribution = App Store. Web = secondary.

---

## ⚠️ PRIME DIRECTIVES — READ FIRST

These rules are absolute. They cannot be overridden by context, convenience, or assumed intent.

1. **iOS First.** Every UI component must be designed for a 390px iPhone screen with bottom navigation. Web desktop is secondary.
2. **Never invent architecture.** If a pattern isn't in this document, ask before implementing.
3. **Never install a package** that isn't listed in the approved dependencies or explicitly requested in the current sprint.
4. **Never create a new DB table** without the exact SQL from Part 8 of this document.
5. **Never modify a file from a completed sprint** unless the current sprint explicitly says to.
6. **Always check actual file contents before editing.** Column names, import paths, and export signatures must be verified from the real codebase, not assumed.
7. **Always use named exports in App Router API routes.** `export async function POST()` not `export default`.
8. **Never break the build.** Run `npx tsc --noEmit` before completing any phase.
9. **Subscription gates are mandatory.** Every Pro/Plus feature must check `subscription_tier` server-side.
10. **Commit after every phase.** `git add -A && git commit -m "..." && git push` at phase end.
11. **Test on iOS before marking complete.** Open browser at 390×844 mobile emulation minimum. Physical device before App Store submission.
12. **No hover states.** iOS has no hover. Use `active:` states only.
13. **All touch targets ≥ 44px height.** Apple's minimum — non-negotiable.

---

## Part 1 — Project Identity

| Field | Value |
|---|---|
| **Product** | TrueNorthPoints — iOS App |
| **Tagline** | Canada's smartest rewards optimizer |
| **Primary Distribution** | Apple App Store |
| **Bundle ID** | ca.truenorthpoints.app |
| **App Store Name** | TrueNorthPoints: Rewards Advisor |
| **App Store Subtitle** | Canadian Credit Cards & Points |
| **App Store Category** | Finance |
| **Secondary Category** | Travel |
| **Age Rating** | 4+ |
| **Web Backend** | https://truenorthpoints.ca (Vercel) |
| **Repo** | github.com/skygupta-codes/PointNorth |
| **Primary Market** | Canada (EN + FR Quebec) |
| **Project Start** | Feb 26, 2026 |
| **Target App Store Submission** | April 1, 2026 |
| **Target App Store Launch** | April 7, 2026 |

---

## Part 2 — Tech Stack (Locked)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 | App Router, Turbopack |
| Language | TypeScript | Strict mode |
| Auth | Clerk | Google + Email + **Apple Sign In** ✅ required for App Store |
| Database | Supabase | PostgreSQL, AWS us-east-1 |
| ORM | Drizzle ORM | Schema in `src/db/schema.ts` |
| Payments | Stripe | **Web-only** — hidden in iOS binary (see Part 4) |
| AI Primary | Anthropic Claude | `claude-sonnet-4-5` |
| AI Fallback 1 | OpenAI GPT-4o | Falls back if Claude throws |
| AI Fallback 2 | Google Gemini | `gemini-2.5-flash` |
| Flight Prices | Duffel API | `@duffel/api` SDK — test mode now, live before launch |
| Email | Resend | Sprint 11 |
| Availability | Seats.aero | Sprint 12, $49 USD/mo |
| UI Components | shadcn/ui | Radix primitives |
| Icons | Lucide React | `lucide-react` |
| Styling | Tailwind CSS | Utility classes only, no custom CSS files |
| Hosting | Vercel | Auto-deploy on push |
| **Mobile Shell** | **Capacitor 6** | **iOS WebView — primary product delivery** |
| **iOS Build Tool** | **Xcode 16** | Required for App Store submission |
| Push Notifications | `@capacitor/push-notifications` | Sprint 11 |
| Haptics | `@capacitor/haptics` | Sprint 10 Phase 4+ |
| Keyboard | `@capacitor/keyboard` | Sprint 10 Phase 4 (chat fix) |
| i18n | next-intl | Sprint 13 |

**Package manager:** `pnpm` always. Never `npm install` or `yarn add`.

---

## Part 3 — iOS App Architecture

### How Capacitor Works
```
App Store → User downloads → Capacitor iOS shell (Xcode binary)
    ↓ WebView loads
https://truenorthpoints.ca (Next.js on Vercel)
    ↓ API calls
Supabase + Stripe + Duffel + Claude
```

**Key principle:** Feature updates deploy instantly via `git push` — no App Store resubmission. Only native capability changes (push notifications, icons, permissions, Capacitor plugins) require a new Xcode build.

### capacitor.config.ts (Verified Configuration)
```typescript
const config: CapacitorConfig = {
  appId: 'ca.truenorthpoints.app',
  appName: 'TrueNorthPoints',
  webDir: 'out',                         // verify against actual build output dir
  server: {
    url: 'https://truenorthpoints.ca',   // loads live site
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',           // handles safe areas automatically
    backgroundColor: '#ffffff',
    preferredContentMode: 'mobile',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      spinnerColor: '#f59e0b',
    },
  },
};
```

---

## Part 4 — Stripe + Apple IAP (Critical Decision — Locked)

### The Problem
Apple requires In-App Purchase (IAP) for digital subscriptions sold **within** iOS app UI — with a 30% cut (15% for small businesses).

### The Solution (Locked — Do Not Change)
**Subscriptions are sold on the web only. The iOS binary never shows Stripe checkout.**

```typescript
// src/lib/native.ts — create this file in Sprint 10 Phase 4
export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).Capacitor !== 'undefined' &&
         (window as any).Capacitor.isNativePlatform();
};
```

```tsx
// In /billing and /upgrade pages — gate Stripe UI
import { isNativeApp } from "@/lib/native";

if (isNativeApp()) {
  return (
    <div className="p-6 text-center">
      <p className="text-gray-600 mb-4">
        To subscribe or manage your plan, visit truenorthpoints.ca in Safari.
      </p>
      <a
        href="https://truenorthpoints.ca/upgrade"
        className="text-amber-600 font-semibold underline"
      >
        Open in Safari →
      </a>
    </div>
  );
}
// Normal Stripe checkout renders for web users
```

Web subscribers get full access in the app via their `subscription_tier` in the DB — no IAP needed.

---

## Part 5 — iOS App Store Launch Roadmap

### Phase A — Apple Developer Setup (Do Now, Parallel to Sprint 10)

| Step | Task | Status |
|---|---|---|
| A1 | Apple Developer Account active at developer.apple.com ($99 USD/yr) | ☐ Confirm |
| A2 | Bundle ID `ca.truenorthpoints.app` registered | ☐ Confirm |
| A3 | App Store Connect app record created — "TrueNorthPoints: Rewards Advisor" | ☐ Confirm |
| A4 | Distribution certificate created | ☐ Confirm |
| A5 | App Store provisioning profile created + linked to bundle ID | ☐ Confirm |
| A6 | Push Notification capability enabled on bundle ID | ☐ Sprint 11 |
| A7 | Sign In with Apple capability enabled | ✅ Done |

---

### Phase B — iOS UX Compliance (Every Sprint Must Pass)

Every feature built must pass all of these before marking complete.

#### B1 — Safe Area Insets
Add to `app/globals.css` if not present:
```css
/* Prevent content behind Dynamic Island and home indicator */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-nav {
  padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
}
html, body {
  overscroll-behavior: none; /* No rubber-band scroll showing white edges */
}
```

#### B2 — Touch Targets
- Every button, link, interactive element: **minimum 44px height**
- Adjacent tap targets: **minimum 8px gap**
- Bottom nav items: **minimum 60px height** including label

#### B3 — No Hover States
```
❌ hover:bg-gray-100
✅ active:bg-gray-100 transition-colors duration-150
```

#### B4 — iOS Typography
```
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
```
Never add Google Fonts — they load slowly in WebView.

#### B5 — Bottom Navigation Rules
- Always sticky to viewport bottom
- Maximum 5 items
- Active: amber `#f59e0b` · Inactive: grey `#9ca3af`
- Icons + labels (never icon-only)
- Current items: Home, Travel, Aeroplan, Points, Maple ✅

#### B6 — Keyboard Avoidance
Chat input must scroll above keyboard. Install in Sprint 10 Phase 4:
```bash
pnpm add @capacitor/keyboard
```

#### B7 — Loading States
Every async operation needs a skeleton screen or loading state. Never leave blank screen.
- Lists → grey skeleton rows
- Buttons → spinner inside, disabled
- Pages → skeleton of expected layout

#### B8 — Error States
Every error needs: clear message + retry button. Never a blank screen.

#### B9 — Pull to Refresh
Dashboard, Loyalty, and Alerts pages must support pull-to-refresh.

#### B10 — Haptic Feedback
Install in Sprint 10 Phase 4:
```bash
pnpm add @capacitor/haptics
```
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';
await Haptics.impact({ style: ImpactStyle.Light });  // on success
await Haptics.impact({ style: ImpactStyle.Heavy });  // on error
```

---

### Phase C — App Store Assets (Prepare During Sprint 13–14)

#### C1 — App Icon
- 1024×1024 PNG, no transparency, no rounded corners
- Design: maple leaf + amber/gold gradient
- Add to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Use `@capacitor/assets` to auto-generate all required sizes

#### C2 — Splash Screen
- White background `#ffffff`, centered maple leaf, no text
- Duration: 2 seconds max

#### C3 — Screenshots (Required)

| Device | Resolution | Required |
|---|---|---|
| iPhone 6.9" Pro Max | 1320×2868 | ✅ Required |
| iPhone 6.7" Plus | 1290×2796 | ✅ Required |
| iPhone 5.5" | 1242×2208 | Optional |

**6 recommended screenshots:**
1. Dashboard — "Your rewards at a glance"
2. Travel Planner — "65,000 miles or $4,823 CAD? We do the math."
3. Maple AI — "Ask Maple anything about your points"
4. Aeroplan Hub — "12 sweet spots ranked by real value"
5. Wallet — "35 Canadian credit cards, one place"
6. Deal Alerts — "Never miss a transfer bonus again"

#### C4 — App Store Metadata
```
App Name:     TrueNorthPoints: Rewards Advisor
Subtitle:     Canadian Credit Cards & Points
Keywords:     aeroplan,credit card,rewards,points,travel,canada,
              cashback,loyalty,miles,visa,mastercard,amex,scene
Description (first 255 chars — shown without tapping "more"):
  TrueNorthPoints is Canada's smartest rewards optimizer. Track your 
  Aeroplan miles, credit card points, and loyalty programs — then let 
  Maple AI show you exactly when to redeem and how to maximize every dollar.
```

#### C5 — Legal (Must Be Live Before Submission)
- Privacy Policy: `truenorthpoints.ca/privacy`
  - Must cover: Supabase storage, Clerk auth, Stripe payments, AI chat content, push notifications
- Terms of Service: `truenorthpoints.ca/terms`
- Support URL: `truenorthpoints.ca/support` or support email

---

### Phase D — Push Notifications (Sprint 11)

#### Notification Types

| Type | Trigger | Gate | Example Copy |
|---|---|---|---|
| Expiry Warning | Cron Monday 9am | Plus+ | "⚠️ Scene+ points expire in 30 days" |
| Transfer Bonus | RSS match | Pro | "🔥 Amex MR → Aeroplan 30% bonus — ends Sunday" |
| Flash Sale | RSS match | Plus+ | "✈️ Flash sale: YYZ→LHR from $499" |
| Weekly Deal | Cron Tuesday 8am | All | "🍁 This week's best Aeroplan redemption" |
| Saved Search Hit | Cron Daily 7am | Pro | "✅ Business class Tokyo just opened June 15" |

#### Push Token Storage (Add in Sprint 11 Migration)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;
```

#### iOS Permission Request Flow
Ask for push permission after onboarding completes (not on first launch):
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

const requestPushPermission = async () => {
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive === 'granted') {
    await PushNotifications.register();
  }
};
// Call this after onboarding step 3 completes
```

---

### Phase E — TestFlight Beta (After Sprint 14, ~Mar 29)

| Step | Action |
|---|---|
| E1 | `pnpm build` passes with zero errors |
| E2 | `pnpm cap:sync` — sync web assets to iOS |
| E3 | Open Xcode → Product → Archive |
| E4 | Upload to App Store Connect via Xcode Organizer |
| E5 | Add internal testers (up to 100, instant — no review) |
| E6 | Add external testers (up to 10,000 — requires 1-2 day Apple review) |
| E7 | Collect feedback 1 week |
| E8 | Fix critical issues, re-upload |
| E9 | Proceed to App Store submission |

---

### Phase F — App Store Submission (April 1, 2026)

| Step | Task |
|---|---|
| F1 | All screenshots uploaded (6.9" and 6.7") |
| F2 | Description, keywords, subtitle filled |
| F3 | Privacy policy URL live |
| F4 | Age rating: 4+ |
| F5 | Pricing: Free (no IAP — subscriptions via web) |
| F6 | Export compliance: No (standard HTTPS only) |
| F7 | "Made for Kids": No |
| F8 | Submit for review (24–48 hour typical turnaround) |
| F9 | Respond to reviewer questions within 24h |
| F10 | Approve for release |

**Common rejection reasons to avoid:**
- ❌ Stripe checkout in iOS binary → handled in Part 4
- ❌ Missing Sign In with Apple → ✅ already implemented
- ❌ App just shows a website with no native value → we have AI, push, haptics
- ❌ Crash on launch → test on physical device before submission
- ❌ Missing privacy policy → build before Sprint 14 ends
- ❌ Screenshots don't match app → take real screenshots
- ❌ Broken links → verify all URLs in description

---

## Part 6 — iOS Feature Requirements Per Sprint

### Sprint 10 iOS Items
- `/travel` page: stacks vertically at <640px (no side-by-side columns on mobile)
- Airport autocomplete dropdown: scrollable on iOS, max 5 visible items
- Search button: full-width, 48px height minimum
- Results card: single column on mobile, no horizontal scroll
- `src/lib/native.ts`: create `isNativeApp()` utility
- Hide Stripe checkout in upgrade/billing pages when `isNativeApp()` is true

### Sprint 11 iOS Items
- Push permission request at end of onboarding
- Store push token in `users.push_token`
- Deal alerts page: scrollable card list, not data table
- Email + push sent simultaneously for eligible alerts

### Sprint 12 iOS Items
- Availability calendar: day cells minimum 44×44px
- Month navigation: swipe gesture (left/right) in addition to buttons
- Clicking available date: opens **bottom sheet**, not new page

### Sprint 13 iOS Items
- Language switcher: in bottom nav or easily reachable within thumb zone
- French locale persisted in `localStorage` across sessions
- Hotel search form: 44px input height, single column

### Sprint 14 iOS Items
- Expert booking: Calendly opens in **in-app browser** (SFSafariViewController), not external Safari
- WestJet deep link: opens external browser with confirmation dialog
- eUpgrade tracker: simple vertical form, not a table layout

---

## Part 7 — Project Structure

```
/                                  ← Project root
├── ANTIGRAVITY_BRAIN.md           ← This file — always up to date
├── capacitor.config.ts            ← iOS shell configuration
├── vercel.json                    ← Cron job definitions
├── ios/                           ← Xcode project — do NOT edit manually
│   └── App/
│       ├── App/
│       │   ├── Assets.xcassets/   ← App icon + splash screen here
│       │   └── Info.plist         ← iOS permissions declared here
│       └── App.xcworkspace        ← Open THIS in Xcode (not .xcodeproj)
└── src/
    ├── app/
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   │   ├── dashboard/page.tsx
    │   │   ├── wallet/page.tsx
    │   │   ├── spending/page.tsx
    │   │   ├── recommendations/page.tsx
    │   │   ├── chat/page.tsx
    │   │   ├── loyalty/page.tsx
    │   │   ├── aeroplan/page.tsx
    │   │   ├── billing/page.tsx
    │   │   ├── upgrade/page.tsx
    │   │   ├── travel/page.tsx          ← Sprint 10
    │   │   ├── alerts/page.tsx          ← Sprint 11
    │   │   ├── experts/page.tsx         ← Sprint 14
    │   │   └── travel/
    │   │       ├── hotels/page.tsx      ← Sprint 13
    │   │       └── eupgrades/page.tsx   ← Sprint 14
    │   ├── api/
    │   │   ├── cards/route.ts
    │   │   ├── chat/route.ts
    │   │   ├── loyalty-accounts/route.ts
    │   │   ├── points-history/route.ts
    │   │   ├── stripe/checkout/ portal/ webhooks/
    │   │   ├── travel/
    │   │   │   ├── airports/route.ts        ✅ Sprint 10
    │   │   │   ├── flight-search/route.ts   ✅ Sprint 10
    │   │   │   ├── availability/route.ts    ← Sprint 12
    │   │   │   ├── saved-searches/route.ts  ← Sprint 12
    │   │   │   └── hotels/route.ts          ← Sprint 13
    │   │   ├── cron/
    │   │   │   ├── expiry-alerts/route.ts   ← Sprint 11
    │   │   │   ├── fetch-alerts/route.ts    ← Sprint 11
    │   │   │   ├── weekly-digest/route.ts   ← Sprint 11
    │   │   │   └── check-saved-searches/    ← Sprint 12
    │   │   └── webhooks/clerk/route.ts
    │   └── layout.tsx
    ├── components/
    │   ├── layout/dashboard-layout.tsx  ← Sidebar + bottom nav — edit for nav items
    │   ├── aeroplan/
    │   │   ├── status-tracker.tsx
    │   │   ├── sweet-spots-grid.tsx
    │   │   ├── zone-calculator.tsx
    │   │   └── transfer-partners-panel.tsx  ← Sprint 10 carry-over
    │   ├── travel/                          ← Sprint 10
    │   │   ├── flight-search-form.tsx
    │   │   ├── results-comparison-card.tsx
    │   │   ├── value-badge.tsx
    │   │   ├── shortfall-card.tsx
    │   │   └── cash-options-list.tsx
    │   └── ui/                             ← shadcn — never edit manually
    ├── data/
    │   ├── aeroplan-award-chart.ts          ✅ Sprint 9
    │   ├── airport-zones.ts                 ✅ Sprint 9
    │   ├── aeroplan-sweet-spots.json        ✅ Sprint 9
    │   └── experts.ts                       ← Sprint 14
    ├── lib/
    │   ├── cards.ts
    │   ├── native.ts                        ← NEW Sprint 10: isNativeApp()
    │   ├── email.ts                         ← Sprint 11
    │   ├── maple/build-system-prompt.ts
    │   ├── supabase/client.ts + admin.ts
    │   └── travel/
    │       ├── duffel.ts                    ✅ Sprint 10
    │       ├── calculations.ts              ✅ Sprint 10
    │       ├── seats-aero.ts               ← Sprint 12
    │       └── travelpayouts.ts            ← Sprint 10
    ├── db/schema.ts                         ← Source of truth for column names
    └── emails/                             ← Sprint 11
```

---

## Part 8 — Database Schema (Complete — Verify Against schema.ts)

### ⚠️ Always verify column names from `src/db/schema.ts` before writing Supabase queries.

**users**
```sql
id                     UUID PRIMARY KEY
"clerkId"              TEXT UNIQUE NOT NULL    ← camelCase, quoted
email                  TEXT NOT NULL
"firstName"            TEXT
"lastName"             TEXT
province               TEXT
subscription_tier      TEXT DEFAULT 'free'     ← 'free' | 'plus' | 'pro'
stripe_customer_id     TEXT
stripe_subscription_id TEXT
locale                 TEXT DEFAULT 'en'
push_token             TEXT                    ← add Sprint 11
push_enabled           BOOLEAN DEFAULT false   ← add Sprint 11
created_at             TIMESTAMPTZ DEFAULT NOW()
updated_at             TIMESTAMPTZ DEFAULT NOW()
```

**user_cards**
```sql
id                     UUID PRIMARY KEY
user_id                UUID REFERENCES users(id) ON DELETE CASCADE
card_id                TEXT
current_points_balance INTEGER DEFAULT 0       ← verify exact name in schema.ts
points_expiry_date     DATE
notes                  TEXT
created_at             TIMESTAMPTZ
updated_at             TIMESTAMPTZ
```

**card_catalog** (seeded, static)
```sql
id               TEXT PRIMARY KEY              ← slug e.g. 'amex-cobalt'
name             TEXT NOT NULL
issuer           TEXT NOT NULL
reward_currency  TEXT NOT NULL                 ← 'mr'|'td-points'|'rbc-avion'|'cibc-aventura'|'scene'|'cash'
annual_fee_cad   INTEGER
earn_rates       JSONB
welcome_bonus    INTEGER
```

**spending_profiles**
```sql
id UUID PRIMARY KEY · user_id UUID UNIQUE · groceries/dining/gas/travel/streaming/shopping/transit/other/drugstore INTEGER DEFAULT 0 · updated_at TIMESTAMPTZ
```

**chat_messages**
```sql
id UUID PRIMARY KEY · user_id UUID · role TEXT ('user'|'assistant') · content TEXT · created_at TIMESTAMPTZ
```

**user_loyalty_accounts**
```sql
id UUID PRIMARY KEY · user_id UUID · program TEXT · current_balance INTEGER · status_tier TEXT · points_expiry_date DATE · notes TEXT · updated_at TIMESTAMPTZ
```

**points_history**
```sql
id UUID PRIMARY KEY · user_id UUID · card_id TEXT · program TEXT · change_amount INTEGER · balance_after INTEGER · reason TEXT · created_at TIMESTAMPTZ
```

**award_search_cache** ✅ Created Mar 5, 2026
```sql
id UUID PRIMARY KEY · cache_key TEXT UNIQUE · result_json JSONB · cached_at TIMESTAMPTZ · expires_at TIMESTAMPTZ NOT NULL
```

### Sprint 11 Migrations
```sql
CREATE TABLE deal_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL, source TEXT NOT NULL, source_url TEXT UNIQUE NOT NULL,
  excerpt TEXT, keywords TEXT[], alert_type TEXT CHECK (alert_type IN
  ('transfer_bonus','flash_sale','increased_offer','devaluation','promo')),
  programs_affected TEXT[], trust_score INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true, expires_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deal_alerts_active ON deal_alerts(is_active, discovered_at DESC);
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;
```

### Sprint 12 Migrations
```sql
CREATE TABLE user_saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  origin_airport CHAR(3), destination_airport CHAR(3), cabin TEXT,
  earliest_date DATE, latest_date DATE,
  alert_on_availability BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own searches" ON user_saved_searches
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE "clerkId" = current_setting('app.clerk_id', true)));
```

### Sprint 13 Migrations
```sql
CREATE TABLE hotel_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, point_currency TEXT NOT NULL,
  transfer_partners TEXT[], fifth_night_free BOOLEAN DEFAULT false,
  point_value_cents DECIMAL(5,3), website TEXT, last_verified DATE
);
CREATE TABLE hotel_award_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES hotel_programs(id),
  category_number INTEGER NOT NULL, category_label TEXT,
  points_per_night INTEGER NOT NULL, points_per_night_peak INTEGER,
  points_per_night_off_peak INTEGER, cash_value_low_cad INTEGER,
  cash_value_high_cad INTEGER, last_verified DATE,
  UNIQUE(program_id, category_number)
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
```

### Sprint 14 Migrations
```sql
CREATE TABLE user_eupgrade_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0, expiry_date DATE,
  status_tier TEXT, target_routes TEXT[], notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 9 — Environment Variables

### Active Now
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
DUFFEL_API_KEY=duffel_test_REDACTED
# ⚠️ Flip to duffel_live_... before App Store launch
```

### Add Each Sprint
```bash
# Sprint 10 (optional, revenue)
TRAVELPAYOUTS_MARKER=

# Sprint 11
RESEND_API_KEY=
CRON_SECRET=            # openssl rand -hex 32
ADMIN_EMAIL=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# Sprint 12 (only after 10 Pro subscribers confirmed)
SEATS_AERO_API_KEY=
```

---

## Part 10 — Sprint Completion Status

| Sprint | Name | Status | Completion |
|---|---|---|---|
| 1–6 | Foundation + iOS + Deploy | ✅ Done | 32% |
| 7 | Stripe Monetization | ✅ Done | 40% |
| 8 | Points & Loyalty | ✅ Done | 51% |
| 9 | Aeroplan Deep Dive | ✅ Done | 59% |
| **10** | **Travel Planner P1** | **🔄 In Progress** | **70%** |
| 11 | Email + Alerts + Push Notifications | 🔲 Next | 78% |
| 12 | Travel Planner P2 (Live Availability) | 🔲 Planned | 86% |
| 13 | French + Hotels | 🔲 Planned | 92% |
| 14 | Experts + WestJet + eUpgrades | 🔲 Planned | 100% |
| **iOS-A** | **Apple Dev Setup + Assets** | **🔲 Parallel** | — |
| **iOS-B** | **TestFlight Beta** | **🔲 After S14** | — |
| **iOS-C** | **App Store Submission** | **🔲 April 1** | — |

---

## Part 11 — Sprint 10 Current Status

### Confirmed Complete ✅
- Phase 2A: `src/lib/travel/duffel.ts` — getCashFlightPrices() working
- Phase 2B: `src/app/api/travel/airports/route.ts` — returning JSON verified
- Phase 3A: `src/lib/travel/calculations.ts` — analyzeRedemption(), calcShortfall()
- Phase 3B: `src/app/api/travel/flight-search/route.ts` — full result verified live

### Verified Live API Response (Mar 5, 2026)
```json
{
  "milesCost": 60000, "cashOptions": [{"totalCad": 1797.75, "airline": "Duffel Airways"}],
  "analysis": {"centsPerMile": 3, "valueTier": "great"},
  "userAeroplanBalance": 2500, "shortfall": {"shortfall": 57500},
  "transferableCards": [{"name": "American Express Platinum Card", "balance": 46285, "currency": "mr"}],
  "liveAvailability": null
}
```
Note: "Duffel Airways" is test mode — real airlines on live token. CPM 3¢ reflects test prices.

### Pending ❌
- Phase 1A: Claude as primary AI
- Phase 1B: Maple Aeroplan system prompt
- Phase 1C: Transfer Partners panel on /aeroplan
- Phase 4A: FlightSearchForm (iOS-optimized)
- Phase 4B: ResultsComparisonCard + ValueBadge
- Phase 4C: /travel page + sidebar nav + `src/lib/native.ts`
- Phase 5A: Verification pass
- Phase 5B: iOS Capacitor sync

---

## Part 12 — Subscription Gates

| Feature | Gate | Server-Side Check |
|---|---|---|
| Card wallet >3 cards | Plus+ | `subscription_tier IN ('plus','pro')` |
| AI chat unlimited | Plus+ | Same |
| Expiry alerts (email + push) | Plus+ | Same |
| Deal alert emails | Plus+ | Same |
| Travel Planner | Pro | `subscription_tier = 'pro'` |
| Expert Consultations | Pro | Same |
| Live availability (Seats.aero) | Pro | Same |
| Saved search alerts | Pro | Same |
| Aeroplan hub | Free | No gate |
| Loyalty programs | Free | No gate |
| Deal feed (view) | Free | No gate |
| **Stripe checkout UI** | **Web only** | **Hidden in iOS via isNativeApp()** |

---

## Part 13 — AI Provider Chain + Maple Prompt

**Order:** Claude `claude-sonnet-4-5` → GPT-4o → Gemini 2.5 Flash

### Maple System Prompt Structure (in order)
1. Identity: "You are Maple 🍁, Canada's smartest rewards advisor..."
2. **iOS context:** "User is on iPhone. Responses must be under 150 words unless showing math. Use bullet points. Never use markdown tables."
3. User's card wallet with balances + reward currencies
4. User's spending profile by category
5. User's loyalty accounts + Aeroplan balance + status tier
6. Aeroplan intelligence: sweet spots reference + fuel surcharge rule + CPM math rule
7. Canadian rules: CAD only, Canadian merchants, Canadian cards only

---

## Part 14 — CPM Value Tiers

| Tier | CPM | Tailwind | Emoji |
|---|---|---|---|
| Exceptional | ≥ 6.0¢ | `text-green-600 bg-green-100` | 🟢 |
| Great | ≥ 3.0¢ | `text-lime-600 bg-lime-100` | 🟡 |
| Good | ≥ 2.0¢ | `text-amber-500 bg-amber-100` | 🟠 |
| Poor | ≥ 1.0¢ | `text-red-500 bg-red-100` | 🔴 |
| Terrible | < 1.0¢ | `text-red-900 bg-red-200` | ⛔ |

Baseline Aeroplan value: 1.5¢/mile. Anything ≥3¢ beats standard cash back.

---

## Part 15 — Aeroplan Transfer Partners

| Currency | Ratio | Transfer Time |
|---|---|---|
| Amex MR (`mr`) | 1:1 | 1–3 business days |
| TD Points (`td-points`) | 1:1 | Instant |
| RBC Avion (`rbc-avion`) | 1:1 | 1–2 business days |
| CIBC Aventura (`cibc-aventura`) | 1:1 | 1–2 business days |

In `calcShortfall()`: only filter currencies IN `['mr','td-points','rbc-avion','cibc-aventura']`.

---

## Part 16 — Coding Patterns

### Supabase (Server Only — Never in Client Components)
```typescript
import { supabaseAdmin } from "@/lib/supabase/admin";
const { data, error } = await supabaseAdmin
  .from("table_name").select("col1, col2")
  .eq("clerkId", userId).single();
```

### Auth (API Routes)
```typescript
import { auth } from "@clerk/nextjs/server";
const { userId } = auth();
if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### Capacitor Detection (src/lib/native.ts)
```typescript
export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).Capacitor !== 'undefined' &&
         (window as any).Capacitor.isNativePlatform();
};
```

### Error Responses
```typescript
NextResponse.json({ error: "Unauthorized" }, { status: 401 })
NextResponse.json({ error: "Pro required", upgrade: true }, { status: 403 })
NextResponse.json({ error: "Bad request" }, { status: 400 })
```

### Cache Pattern (award_search_cache)
```typescript
const cacheKey = `${origin}-${dest}-${date}-${cabin}`;
const { data: cached } = await supabaseAdmin.from("award_search_cache")
  .select("result_json").eq("cache_key", cacheKey)
  .gt("expires_at", new Date().toISOString()).maybeSingle();
if (cached) return NextResponse.json(cached.result_json);
// ... build result ...
await supabaseAdmin.from("award_search_cache").upsert({
  cache_key: cacheKey, result_json: result,
  expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
}, { onConflict: "cache_key" });
```

---

## Part 17 — Anti-Deviation Rules

| ❌ Never | ✅ Always |
|---|---|
| `export default` in API routes | `export async function POST/GET` |
| `src/pages/api/` | `src/app/api/` |
| `hover:` Tailwind only | `active:` Tailwind |
| Touch targets < 44px | Min 44px height |
| Stripe checkout in iOS binary | `isNativeApp()` check → web-only message |
| `npm` or `yarn` | `pnpm` |
| Amadeus API | Duffel only |
| Numeric zone IDs | `getZonePairId()` string zones |
| `any` TypeScript | Define interfaces |
| Skip Pro/Plus gate | Always server-side |
| Desktop multi-column on mobile | Stack vertically <640px |
| Tables in mobile lists | Cards / stacked rows |
| Skip iOS checklist | Run before every commit |
| Skip `git push` | Always commit + push at phase end |

---

## Part 18 — Info.plist Permissions (ios/App/App/Info.plist)

```xml
<!-- Add as features are built — do not add unused permissions -->

<!-- Sprint 11: Push Notifications -->
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>

<!-- Future: Face ID (if biometric auth added) -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to securely sign in to TrueNorthPoints</string>
```

---

## Part 19 — iOS Phase Verification Checklist

Run before every commit. All must be ✅.

```
iOS Phase Verification:
[ ] File at correct path (App Router, not Pages Router)
[ ] TypeScript clean: npx tsc --noEmit = 0 errors
[ ] Named exports in all API routes
[ ] No hardcoded API keys (process.env only)
[ ] Column names verified against src/db/schema.ts
[ ] Subscription gate enforced server-side
[ ] No unapproved packages installed
[ ] isNativeApp() check in billing/upgrade pages (if modified)
[ ] All touch targets ≥ 44px
[ ] No hover-only states
[ ] Tested at 390×844 mobile browser emulation
[ ] Loading + error states implemented
[ ] git add -A && git commit && git push done
[ ] Live URL verified (API routes)
```

---

## Part 20 — App Store Pre-Submission Checklist

```
Apple Requirements:
[ ] Sign In with Apple ✅ already implemented
[ ] Privacy policy live at truenorthpoints.ca/privacy
[ ] Terms of service live at truenorthpoints.ca/terms
[ ] No Stripe checkout UI in iOS binary
[ ] Push notification permission flow after onboarding
[ ] App does not crash on launch (physical device test)
[ ] Screenshots: 6.9" and 6.7" uploaded (6 screens minimum)
[ ] App icon: 1024×1024 PNG no transparency
[ ] Age rating: 4+ questionnaire completed
[ ] Export compliance: No
[ ] App name "TrueNorthPoints: Rewards Advisor" available

iOS UX:
[ ] Safe area insets respected on all pages
[ ] All touch targets ≥ 44px
[ ] No hover states anywhere
[ ] Keyboard avoidance on Maple chat
[ ] Loading states on all async operations
[ ] Error states with retry on all pages
[ ] Bottom navigation correct on all pages
[ ] Pull to refresh on Dashboard + Loyalty + Alerts
[ ] Tested on iPhone 15 Pro (physical or Simulator)
[ ] Tested on iPhone SE (smallest supported — 375px)
```

---

## Part 21 — Commit Message Convention

```
Sprint X Phase Y: description
iOS: description
fix: description
chore: description

Examples:
Sprint 10 Phase 4A: FlightSearchForm iOS-optimized 390px
Sprint 10 Phase 4C: travel page + isNativeApp Stripe gate
iOS: safe area insets on travel page
iOS: hide Stripe checkout in native binary
fix: touch targets bottom nav increased to 48px
chore: remove test route before App Store submission
```

---

## Part 22 — App Store Launch Timeline

```
Mar 5–7:    Sprint 10 complete (Travel Planner Phase 1)
Mar 6–7:    Sprint 11 (Email + Deal Alerts + Push Setup)
Mar 8–10:   Sprint 12 (Live Availability — Seats.aero)
Mar 11–13:  Sprint 13 (French + Hotels)
Mar 14–15:  Sprint 14 (Experts + WestJet + eUpgrades)
Mar 15:     Privacy policy + Terms pages live
Mar 20:     App icon + screenshots created
Mar 20:     iOS-A complete (Apple Dev setup confirmed)
Mar 28:     All sprints done — full iOS UX pass
Mar 29:     Xcode archive → TestFlight internal (iOS-B)
Apr 1:      External TestFlight opens + App Store submission (iOS-C)
Apr 7:      🚀 Target App Store approval + launch
```

---

## Part 23 — Decision Log (Locked — Do Not Revisit)

| Decision | Rationale | Date |
|---|---|---|
| iOS App as primary product | App Store = primary distribution channel | Mar 5, 2026 |
| Stripe subscriptions via web only | Avoid Apple 30% IAP cut | Mar 5, 2026 |
| Capacitor WebView loads live Vercel site | Feature deploys without App Store re-submit | Feb 26, 2026 |
| Duffel replaces Amadeus | Amadeus self-service shut down Feb 9, 2026 | Mar 2, 2026 |
| Claude as primary AI | Better Canadian card + Aeroplan reasoning | Mar 5, 2026 |
| Zone IDs as strings | `getZonePairId()` established in Sprint 9 | Mar 5, 2026 |
| 4h cache TTL for flight search | Cost vs. freshness balance | Mar 5, 2026 |
| 6h cache TTL for availability | Seats.aero data stability | Mar 2, 2026 |
| Travelpayouts affiliate on cash results | Cash comparison becomes revenue | Mar 2, 2026 |
| Seats.aero after 10 Pro subscribers | Justify $49/mo before activating | Mar 2, 2026 |
| Calendly opens in SFSafariViewController | Keep user in app, not external Safari | Mar 5, 2026 |
| Push via @capacitor/push-notifications | Native delivery, not web push API | Mar 5, 2026 |
| Canadian French tu form | Quebec market standard | Mar 2, 2026 |
| Hotel data seeded manually | No reliable hotel data API at price point | Mar 2, 2026 |
| App Store target April 7, 2026 | Allows 2 weeks TestFlight after Sprint 14 | Mar 5, 2026 |

---

*TrueNorthPoints — Antigravity Master Brain · v3.0 · March 5, 2026*  
*iOS First. Always. This document supersedes all previous versions.*  
*Update Part 10 (sprint status) and Part 23 (decisions) after every sprint.*