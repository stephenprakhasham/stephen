import { Client } from "pg";

/**
 * Direct Postgres access used as a fallback for privileged auth operations when
 * SUPABASE_SERVICE_ROLE_KEY is not configured.
 *
 * Server-only. Credentials come from SUPABASE_DB_PASSWORD (and optional
 * SUPABASE_DB_HOST / SUPABASE_DB_PORT / SUPABASE_DB_USER / SUPABASE_DB_NAME),
 * or a full SUPABASE_DB_URL.
 */

interface DbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

let client: Client | null = null;
let connecting: Promise<Client> | null = null;

function projectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const match = url?.match(/^https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

export function getDbConfig(): DbConfig | null {
  if (process.env.SUPABASE_DB_URL) {
    return { connectionString: process.env.SUPABASE_DB_URL };
  }
  const ref = projectRef();
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!ref || !password) return null;
  return {
    host: process.env.SUPABASE_DB_HOST ?? `db.${ref}.supabase.co`,
    port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
    user: process.env.SUPABASE_DB_USER ?? "postgres",
    password,
    database: process.env.SUPABASE_DB_NAME ?? "postgres",
  };
}

export function isDbConfigured(): boolean {
  return getDbConfig() !== null;
}

/**
 * Execute a parameterized query against the direct Postgres connection.
 * Bypasses PostgREST and RLS — server-side use only.
 */
export async function dbQuery<R = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<R[]> {
  const db = await getClient();
  const result = await db.query<R>(sql, params);
  return result.rows;
}

async function getClient(): Promise<Client> {
  if (client) return client;
  if (connecting) return connecting;

  const config = getDbConfig();
  if (!config) {
    throw new Error(
      "Database access is not configured. Set SUPABASE_DB_PASSWORD (or SUPABASE_DB_URL) in .env.local."
    );
  }

  const next = new Client({
    ...config,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  connecting = next
    .connect()
    .then(() => {
      client = next;
      return next;
    })
    .finally(() => {
      connecting = null;
    });

  return connecting;
}

export async function closeDbConnection(): Promise<void> {
  if (!client) return;
  const current = client;
  client = null;
  await current.end().catch(() => undefined);
}

/**
 * Delete an auth user directly. Cascades to profiles, identities, sessions and
 * role assignments via foreign keys.
 */
export async function deleteAuthUserDirect(userId: string): Promise<boolean> {
  const db = await getClient();
  const { rowCount } = await db.query(
    "delete from auth.users where id = $1",
    [userId]
  );
  return (rowCount ?? 0) > 0;
}

export interface DirectAuthUser {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Create an auth.users row + email identity directly.
 * Passwords are hashed with pgcrypto bcrypt, which GoTrue accepts, and
 * email_confirmed_at is set so the account can sign in immediately.
 */
export async function createAuthUserDirect(input: {
  email: string;
  password: string;
  fullName?: string | null;
}): Promise<DirectAuthUser> {
  const db = await getClient();
  const email = input.email.trim().toLowerCase();
  const fullName = (input.fullName ?? "").trim() || null;

  const existing = await db.query<{ id: string }>(
    "select id from auth.users where lower(email) = lower($1) limit 1",
    [email]
  );
  if (existing.rows.length > 0) {
    throw new Error("A user with this email already exists.");
  }

  try {
    await db.query("begin");

    const { rows } = await db.query<{ id: string; created_at: string }>(
      `insert into auth.users (
         instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
         raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
         confirmation_token, recovery_token, email_change_token_new, email_change
       ) values (
         '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
         $1::text,
         extensions.crypt($2::text, extensions.gen_salt('bf')),
         now(),
         '{"provider":"email","providers":["email"]}'::jsonb,
         jsonb_build_object('full_name', $3::text, 'email_verified', true),
         now(), now(), '', '', '', ''
       )
       returning id, created_at`,
      [email, input.password, fullName]
    );

    const user = rows[0];
    if (!user) throw new Error("Failed to create the user.");

    await db.query(
      `insert into auth.identities (
         provider_id, user_id, identity_data, provider, created_at, updated_at
       ) values (
         $1::text,
         $1::uuid,
         jsonb_build_object(
           'sub', $1::text,
           'email', $2::text,
           'email_verified', true,
           'phone_verified', false
         ),
         'email', now(), now()
       )`,
      [user.id, email]
    );

    await db.query("commit");

    return { id: user.id, email, createdAt: user.created_at };
  } catch (error) {
    await db.query("rollback").catch(() => undefined);
    throw error;
  }
}