# CLAUDE.md — TrueNorthPoints.ca

AI assistant reference for the PointNorth repository. Read this before making changes.

---

## Project Overview

**TrueNorthPoints.ca** is an AI-powered Canadian credit card rewards optimizer. Users connect their credit card wallet, set a spending profile, and get personalized recommendations and an AI chat advisor ("Maple AI") to maximize points earnings.

- Mobile-first Progressive Web App (PWA)
- Canada-specific: provinces, CAD currency, Canadian loyalty programs (Aeroplan, Scene+, etc.)
- Light/white theme only — no dark mode

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui (New York style, zinc) |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL via Supabase, Drizzle ORM 0.45.1 |
| Auth | Clerk 6 (webhook-based user sync) |
| AI (chat) | Google Gemini 2.5-flash (`@google/generative-ai`) |
| AI (SDK) | Anthropic Claude SDK (`@anthropic-ai/sdk`) — configured, not active for chat |
| State | Zustand (global), React Query / TanStack (server state) |
| Validation | Zod 4 |
| Icons | Lucide React |
| Toasts | Sonner |
| Package mgr | pnpm |

---

## Directory Structure

```
/
├── public/                   # Static assets
│   ├── manifest.json         # PWA manifest (app name: TrueNorthPoints.ca)
│   ├── sw.js                 # Service worker
│   └── icons/                # PWA icons
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth pages (Clerk sign-in/sign-up)
│   │   ├── (dashboard)/      # Protected routes (Clerk-gated)
│   │   │   ├── chat/         # Maple AI chat page
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── onboarding/   # First-run onboarding flow
│   │   │   ├── recommendations/ # Card recommendations
│   │   │   ├── spending/     # Spending profile setup
│   │   │   ├── wallet/       # Card wallet management
│   │   │   └── layout.tsx    # Shared dashboard layout
│   │   ├── api/              # API routes
│   │   │   ├── cards/route.ts
│   │   │   ├── chat/route.ts
│   │   │   ├── onboarding/complete/route.ts
│   │   │   ├── recommendations/route.ts
│   │   │   ├── spending-profile/route.ts
│   │   │   └── webhooks/clerk/route.ts
│   │   ├── globals.css       # Global styles + CSS variables
│   │   ├── layout.tsx        # Root layout (ClerkProvider)
│   │   └── page.tsx          # Landing page
│   ├── components/           # Feature-grouped React components
│   │   ├── auth/             # user-nav.tsx
│   │   ├── chat/             # chat-client.tsx
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── layout/           # dashboard-layout.tsx
│   │   ├── onboarding/       # onboarding-client.tsx
│   │   ├── pwa/              # sw-registrar.tsx
│   │   ├── recommendations/  # recommendations-client.tsx
│   │   ├── spending/         # spending-profile-client.tsx
│   │   ├── ui/               # shadcn/ui primitives (do not edit manually)
│   │   └── wallet/           # wallet-client.tsx, wallet-card.tsx, add-card-dialog.tsx
│   ├── data/
│   │   └── canadian-cards.json  # Credit card catalog (~694 lines)
│   ├── db/
│   │   ├── index.ts          # getDb() — safe DB connection accessor
│   │   ├── schema.ts         # Drizzle ORM table definitions
│   │   └── migrations/       # Auto-generated migration files
│   ├── lib/
│   │   ├── ai.ts             # Anthropic Claude API wrapper
│   │   ├── cards.ts          # getAllCards(), getCardBySlug(), searchCards()
│   │   ├── clerk.ts          # Clerk server-side helpers
│   │   ├── recommendations.ts # getBestCardPerCategory(), rankCardsByValue(), getMissedValue()
│   │   ├── supabase.ts       # Supabase client setup
│   │   └── utils.ts          # cn() class merging utility
│   ├── middleware.ts          # Clerk auth guard for (dashboard) routes
│   ├── stores/
│   │   └── user-store.ts     # Zustand user state store
│   └── types/
│       └── index.ts          # CreditCard, UserCard, SpendingProfile, ChatMessage, CANADIAN_PROVINCES
├── components.json           # shadcn/ui configuration
├── drizzle.config.ts         # Drizzle ORM config (dialect: postgresql)
├── next.config.ts            # Next.js config
├── tsconfig.json             # TypeScript (strict, path alias @/* → src/*)
└── eslint.config.mjs         # ESLint (next/core-web-vitals + typescript)
```

---

## Development Commands

```bash
# Development
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database (Drizzle)
pnpm dlx drizzle-kit generate   # Generate migration from schema changes
pnpm dlx drizzle-kit migrate    # Apply pending migrations
pnpm dlx drizzle-kit studio     # Open Drizzle Studio (DB GUI)
```

---

## Environment Variables

Create `.env.local` at the repo root:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI Services
GEMINI_API_KEY=...           # Google Gemini — active for chat
ANTHROPIC_API_KEY=sk-ant-... # Anthropic Claude — configured, not currently active
```

---

## Code Conventions

### Naming
- **Files**: kebab-case (`spending-profile-client.tsx`, `canadian-cards.json`)
- **Components**: PascalCase (`SpendingProfileClient`)
- **Functions & variables**: camelCase (`getAllCards`, `userCards`)
- **Types & interfaces**: PascalCase (`CreditCard`, `SpendingProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (`CANADIAN_PROVINCES`)

### Client vs Server Components
- Server Components by default — no directive needed
- Add `"use client"` at the top only when component uses hooks, event handlers, or browser APIs
- Feature page files under `(dashboard)/*/page.tsx` are typically thin server wrappers that render a `*-client.tsx` component

### Imports
Order: external packages → `@/` absolute imports → relative imports

```typescript
import { useState } from "react";
import { auth } from "@clerk/nextjs/server";

import { getDb } from "@/db";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### Path Alias
Use `@/*` for all non-relative imports. Resolves to `src/*`.

---

## API Route Pattern

Every API route follows this structure:

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/db";

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    // ... business logic ...

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("GET /api/route-name error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

Key points:
- Always authenticate with `auth()` from `@clerk/nextjs/server` first
- Use `getDb()` — never instantiate the DB connection directly
- Log errors as `console.error("METHOD /api/path error:", err)`
- Return typed JSON responses via `NextResponse.json()`

---

## Database Schema

Managed with Drizzle ORM. Schema defined in `src/db/schema.ts`.

### Tables

**`users`** — synced from Clerk via webhook
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | auto-generated |
| clerkId | text UNIQUE | Clerk user ID |
| email | text | |
| name | text | |
| province | text | Canadian province code (e.g., "ON") |
| preferredCurrency | text | default: "aeroplan" |
| onboardingCompleted | boolean | default: false |
| createdAt | timestamp | |

**`userCards`** — credit cards in a user's wallet
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK → users | |
| cardSlug | text | references `canadian-cards.json` slug |
| nickname | text | optional user label |
| pointsBalance | decimal | |
| pointsExpiry | timestamp | optional |
| annualFeeDate | timestamp | optional |
| isPrimary | boolean | default: false |
| addedAt | timestamp | |

**`chatMessages`** — Maple AI conversation history
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK → users | |
| role | text | `'user'` or `'assistant'` |
| content | text | |
| metadata | jsonb | extensible extras |
| createdAt | timestamp | |

**`spendingProfiles`** — monthly spending by category
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK → users | |
| groceries | decimal | CAD/month |
| dining | decimal | |
| gas | decimal | |
| travel | decimal | |
| streaming | decimal | |
| shopping | decimal | |
| transit | decimal | |
| other | decimal | |
| updatedAt | timestamp | |

### Schema Changes Workflow
1. Edit `src/db/schema.ts`
2. Run `pnpm dlx drizzle-kit generate` to create a migration file
3. Run `pnpm dlx drizzle-kit migrate` to apply it
4. Never edit migration files manually

---

## Key Utilities

Always check these before writing new logic:

```typescript
// Class merging (Tailwind + clsx)
import { cn } from "@/lib/utils";
cn("base-class", condition && "conditional-class", className)

// Credit card catalog
import { getAllCards, getCardBySlug, searchCards } from "@/lib/cards";

// Recommendation engine
import { getBestCardPerCategory, rankCardsByValue, getMissedValue } from "@/lib/recommendations";

// Database (safe accessor — throws if DATABASE_URL unset)
import { getDb } from "@/db";
const db = getDb();

// Shared types
import type { CreditCard, UserCard, SpendingProfile, ChatMessage } from "@/types";
import { CANADIAN_PROVINCES } from "@/types";
```

---

## Architecture Patterns

### State Management
- **Zustand** (`src/stores/`) for global client state (user info, UI state)
- **React Query** for server state — cache API responses, handle loading/error
- Avoid prop-drilling; use stores for shared data

### Component Structure
- Feature-specific client components go in `src/components/<feature>/`
- `src/components/ui/` contains shadcn/ui primitives — **do not edit these files manually**
- To add a new shadcn/ui component: `pnpm dlx shadcn@latest add <component-name>`

### Loading States
Use Skeleton components (`src/components/ui/skeleton.tsx`) for all async data. Never show blank UI while loading.

### Functional Style
- No classes — use functions and hooks throughout
- Prefer small, focused functions over large monolithic ones
- Server-side business logic lives in `src/lib/`, not in API route files

---

## Auth & Security

- **Route protection**: `src/middleware.ts` guards all `(dashboard)` routes via Clerk
- **API auth**: Every API route must call `const { userId: clerkId } = await auth()` and return 401 if null
- **Webhooks**: Clerk webhook at `/api/webhooks/clerk` verifies Svix signatures — never skip this check
- **Secrets**: Keep all API keys server-side only; never expose in client components or `NEXT_PUBLIC_` vars (except Clerk publishable key)
- **User lookup**: Always look up the internal `users.id` from `clerkId` before DB queries — do not use Clerk's `userId` as a foreign key directly

---

## AI / LLM Integration

### Maple AI Chat
- Route: `POST /api/chat`, `GET /api/chat`
- Currently uses **Google Gemini 2.5-flash** (switched from Gemini 2.0-flash due to quota exhaustion)
- The Anthropic SDK (`src/lib/ai.ts`) is configured for `claude-sonnet-4-5-20250514` but not currently active for the chat endpoint
- System prompt is dynamically built with: user's wallet cards + earn rates, spending profile, and province
- All messages (user + assistant) are persisted in `chatMessages` table

### Switching AI Provider
To reactivate Claude for chat, update `src/app/api/chat/route.ts` to import from `src/lib/ai.ts` instead of using `@google/generative-ai` directly.

---

## Canada-Specific Domain Logic

- All monetary values are **CAD**
- Point programs: Aeroplan, Scene+, TD Rewards, BMO Rewards, RBC Rewards, Avion, PC Optimum, etc.
- Province codes follow standard Canadian 2-letter abbreviations (defined in `src/types/index.ts` as `CANADIAN_PROVINCES`)
- Credit card earn rates vary by province (Quebec has different rules for some cards)
- The card catalog (`src/data/canadian-cards.json`) only contains cards available in Canada

---

## Common Tasks

### Add a New Page
1. Create `src/app/(dashboard)/<page-name>/page.tsx` (server component wrapper)
2. Create `src/components/<feature>/<page-name>-client.tsx` (client component with logic)
3. Add navigation link in `src/components/layout/dashboard-layout.tsx`

### Add a New API Endpoint
1. Create `src/app/api/<resource>/route.ts`
2. Follow the standard auth → validate → logic → respond pattern
3. Export named functions: `GET`, `POST`, `PUT`, `DELETE` as needed

### Add a New DB Table
1. Add table definition to `src/db/schema.ts` using Drizzle syntax
2. Add corresponding TypeScript type to `src/types/index.ts`
3. Run `pnpm dlx drizzle-kit generate && pnpm dlx drizzle-kit migrate`

### Add a New shadcn/ui Component
```bash
pnpm dlx shadcn@latest add <component-name>
```
This places it in `src/components/ui/` automatically.

---

## Testing

No test framework is currently configured. There are no test files in the codebase. When adding tests in the future, Vitest + React Testing Library is the recommended stack for this project type.

---

## Git Conventions

Commit messages follow a day/phase pattern from development history:
```
Day 5 Phase 1: Polish & UX
Fix: switch to gemini-2.5-flash (2.0-flash quota exhausted)
docs: add CLAUDE.md with codebase structure and conventions
```

For AI assistant branches: `claude/<task-description>-<session-id>`

---

## Gotchas

- `getDb()` will **throw** at runtime if `DATABASE_URL` is not set — always check your `.env.local`
- `(auth)` and `(dashboard)` are **route groups** (parentheses = not in URL path)
- shadcn/ui uses **CSS variables** for theming — colors are in `src/app/globals.css`, not `tailwind.config`
- The app uses **Tailwind CSS v4** — config syntax differs from v3 (no `tailwind.config.ts` file; config is in `postcss.config.mjs`)
- Clerk requires a **webhook** to create the `users` row in Postgres. If a user exists in Clerk but not in DB, `src/app/api/cards/route.ts` auto-creates them as a fallback
- Images for cards are external URLs in `canadian-cards.json` — use Next.js `<Image>` with appropriate `domains` in `next.config.ts` if needed
