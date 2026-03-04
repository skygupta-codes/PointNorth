import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS award_search_cache (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            cache_key TEXT UNIQUE NOT NULL,
            result_json JSONB NOT NULL,
            cached_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ NOT NULL
        )
    `);
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_award_cache_key ON award_search_cache(cache_key)`);
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_award_cache_expiry ON award_search_cache(expires_at)`);

    console.log("✅ award_search_cache table + indexes created");

    const tables = await sql.unsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    console.log("\n📋 All public tables:");
    for (const t of tables) {
        console.log("  " + t.tablename);
    }

    await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
