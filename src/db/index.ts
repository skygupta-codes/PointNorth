// Database connection — Drizzle ORM + Supabase PostgreSQL
// Full setup in Day 2 when Supabase is configured

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection will be initialized when DATABASE_URL is configured
const connectionString = process.env.DATABASE_URL;

// Only create connection if DATABASE_URL is set
const client = connectionString
    ? postgres(connectionString, { prepare: false })
    : null;

export const db = client ? drizzle(client, { schema }) : null;
