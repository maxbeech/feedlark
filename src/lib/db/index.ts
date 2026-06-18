import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// A single shared libSQL client. The HTTP driver is serverless-friendly, so a
// module-level singleton is reused safely across Vercel function invocations.
const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema, client };

/** True when a real database is configured (not the local dev fallback). */
export const dbConfigured = Boolean(process.env.TURSO_DATABASE_URL);
