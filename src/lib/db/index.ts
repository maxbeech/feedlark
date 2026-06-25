import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Supabase Postgres via the transaction pooler (serverless-friendly). The pooler
// runs in transaction mode, which doesn't support prepared statements, so we
// disable them. A module-level singleton is reused across function invocations.
const connectionString = process.env.DATABASE_URL ?? "";

const client = postgres(connectionString, {
  prepare: false,
  // Keep the per-instance pool small; many serverless instances share the pooler.
  max: 1,
});

export const db = drizzle(client, { schema });
export { schema, client };

/** True when a real database connection string is configured. */
export const dbConfigured = Boolean(process.env.DATABASE_URL);
