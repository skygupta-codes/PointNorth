// Database schema — Drizzle ORM
// Full schema implementation in Day 2

import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    jsonb,
    boolean,
    decimal,
    date,
    uniqueIndex,
} from "drizzle-orm/pg-core";

// Users (synced from Clerk via webhook)
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull(),
    name: text("name"),
    province: text("province"), // ON, BC, QC, AB, etc.
    preferredCurrency: text("preferred_currency").default("aeroplan"),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    subscriptionTier: text("subscription_tier").default("free"), // 'free' | 'plus' | 'pro'
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at").defaultNow(),
});

// User's card wallet
export const userCards = pgTable("user_cards", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    cardSlug: text("card_slug").notNull(),
    nickname: text("nickname"),
    pointsBalance: integer("points_balance").default(0),
    pointsExpiry: timestamp("points_expiry"),
    annualFeeDate: timestamp("annual_fee_date"),
    isPrimary: boolean("is_primary").default(false),
    addedAt: timestamp("added_at").defaultNow(),
});

// Chat history for Maple AI
export const chatMessages = pgTable("chat_messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    role: text("role").notNull(), // 'user' | 'assistant'
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Spending profile (for recommendations)
export const spendingProfiles = pgTable("spending_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    groceries: decimal("groceries").default("0"),
    dining: decimal("dining").default("0"),
    gas: decimal("gas").default("0"),
    travel: decimal("travel").default("0"),
    streaming: decimal("streaming").default("0"),
    shopping: decimal("shopping").default("0"),
    transit: decimal("transit").default("0"),
    drugstore: decimal("drugstore").default("0"),
    other: decimal("other").default("0"),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Points balance history (audit trail)
export const pointsHistory = pgTable("points_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    cardSlug: text("card_slug").notNull(),
    previousBalance: integer("previous_balance").notNull(),
    newBalance: integer("new_balance").notNull(),
    changeAmount: integer("change_amount").notNull(),
    changeType: text("change_type").notNull(), // 'manual' | 'earned' | 'redeemed' | 'expired' | 'transfer'
    note: text("note"),
    recordedAt: timestamp("recorded_at").defaultNow(),
});

// Standalone loyalty program accounts (Aeroplan, Air Miles, etc.)
export const userLoyaltyAccounts = pgTable(
    "user_loyalty_accounts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        program: text("program").notNull(), // 'aeroplan' | 'air-miles' | 'westjet' | 'scene' | 'pc-optimum' | 'triangle' | 'marriott' | 'hilton'
        accountNumber: text("account_number"),
        currentBalance: integer("current_balance").default(0),
        statusTier: text("status_tier"),
        pointsExpiryDate: date("points_expiry_date"),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => [uniqueIndex("user_program_idx").on(table.userId, table.program)]
);

// Award search cache (shared cache, no user ownership)
export const awardSearchCache = pgTable("award_search_cache", {
    id: uuid("id").primaryKey().defaultRandom(),
    cacheKey: text("cache_key").unique().notNull(),
    resultJson: jsonb("result_json").notNull(),
    cachedAt: timestamp("cached_at", { withTimezone: true }).defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
