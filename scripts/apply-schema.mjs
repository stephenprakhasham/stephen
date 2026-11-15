import { readFileSync } from "node:fs";
import { Client } from "pg";

// Usage:
//   node scripts/apply-schema.mjs                -> applies supabase/schema.sql
//   node scripts/apply-schema.mjs supabase/migrations/0001_phase1_foundation.sql
//   SUPABASE_DB_PASSWORD=... node scripts/apply-schema.mjs <file>

const ref = "nskvbhqmubqucylqfbdu";
const password = process.env.SUPABASE_DB_PASSWORD;
const sqlFile = process.argv[2] || "supabase/schema.sql";
const sql = readFileSync(sqlFile, "utf8");

if (!password) {
  console.error("Set SUPABASE_DB_PASSWORD first.");
  process.exit(1);
}

const targets = [
  { label: "direct", host: `db.${ref}.supabase.co`, port: 5432, user: "postgres", database: "postgres" },
  { label: "pooler", host: "aws-0-ap-southeast-2.pooler.supabase.com", port: 5432, user: `postgres.${ref}`, database: "postgres" }
];

for (const t of targets) {
  const client = new Client({ ...t, password, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    console.log(`[${t.label}] connected`);
    await client.query(sql);
    console.log(`[${t.label}] applied ${sqlFile}`);
    const { rows } = await client.query(
      "select table_name from information_schema.tables where table_schema='public' order by 1"
    );
    console.log("tables: " + rows.map((r) => r.table_name).join(", "));
    const { rows: pol } = await client.query(
      "select count(*)::int as n from pg_policies where schemaname='public'"
    );
    console.log("rls policies: " + pol[0].n);
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error(`[${t.label}] failed: ${error.message}`);
    try { await client.end(); } catch {}
  }
}

process.exit(1);