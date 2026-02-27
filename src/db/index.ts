// Database connection — Drizzle ORM + Supabase PostgreSQL
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn(
        "⚠️  DATABASE_URL not set — database features will be unavailable"
    );
}

// Create connection with connection pooling settings
const client = connectionString
    ? postgres(connectionString, {
        prepare: false,
        max: 10,
        idle_timeout: 20,
    })
    : null;

export const db = client ? drizzle(client, { schema }) : null;

// Helper that throws if DB is not configured
export function getDb() {
    if (!db) {
        throw new Error(
            "Database not configured. Please set DATABASE_URL in .env.local"
        );
    }
    return db;
}
