import "server-only";

import { neon } from "@neondatabase/serverless";

/** Returns a server-only Neon SQL client. DATABASE_URL is never exposed to the browser. */
export function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured on the server.");
  }
  return neon(connectionString);
}
