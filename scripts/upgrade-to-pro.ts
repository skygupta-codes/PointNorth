// Upgrade all users to Pro tier for testing
// Run: DATABASE_URL=... npx tsx scripts/upgrade-to-pro.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

const sql = postgres(url);
const db = drizzle(sql);

async function main() {
    const allUsers = await sql`SELECT id, email, name, subscription_tier FROM users`;
    console.log("\n📋 Current users:");
    for (const u of allUsers) {
        console.log(`  ${u.email} — tier: ${u.subscription_tier || "free"}`);
    }

    const result = await sql`UPDATE users SET subscription_tier = 'pro' RETURNING email, subscription_tier`;
    console.log("\n✅ Upgraded to Pro:");
    for (const u of result) {
        console.log(`  ${u.email} → ${u.subscription_tier}`);
    }

    await sql.end();
}

main().catch(console.error);
