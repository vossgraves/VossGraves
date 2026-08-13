import "server-only";

import argon2 from "argon2";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

const MIN_PASSWORD_LENGTH = 12;

function matchesSetupToken(providedToken: string | null) {
  const expectedToken = process.env.AUTH_SETUP_TOKEN;
  if (!expectedToken || !providedToken) return false;
  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export type SetupResult =
  | { ok: true }
  | { ok: false; status: 400 | 401 | 409 | 503; error: string };

/**
 * Initializes both password scopes exactly once. The setup secret is only a
 * gate; the submitted passwords are immediately converted to Argon2id hashes
 * and are never written to logs, responses, or environment variables.
 */
export async function initializePasswords(
  setupToken: string | null,
  adminPassword: string,
  personalPassword: string,
): Promise<SetupResult> {
  if (!matchesSetupToken(setupToken)) {
    return { ok: false, status: 401, error: "This setup link is invalid or expired." };
  }

  if (
    adminPassword.length < MIN_PASSWORD_LENGTH ||
    personalPassword.length < MIN_PASSWORD_LENGTH ||
    adminPassword.length > 256 ||
    personalPassword.length > 256
  ) {
    return {
      ok: false,
      status: 400,
      error: "Each password must be between 12 and 256 characters.",
    };
  }

  if (adminPassword === personalPassword) {
    return { ok: false, status: 400, error: "Use two different passwords." };
  }

  const [adminHash, personalHash] = await Promise.all([
    argon2.hash(adminPassword, { type: argon2.argon2id }),
    argon2.hash(personalPassword, { type: argon2.argon2id }),
  ]);

  try {
    const rows = await db()`
      WITH gate AS (
        SELECT COUNT(*)::int AS existing_count
        FROM auth_passwords
      ),
      inserted AS (
        INSERT INTO auth_passwords (scope, password_hash)
        SELECT scope, password_hash
        FROM (
          VALUES
            ('admin'::text, ${adminHash}::text),
            ('personal'::text, ${personalHash}::text)
        ) AS requested(scope, password_hash)
        WHERE (SELECT existing_count FROM gate) = 0
        RETURNING scope
      )
      SELECT
        (SELECT existing_count FROM gate) AS existing_count,
        COUNT(*)::int AS inserted_count
      FROM inserted
    `;

    const result = rows[0] as
      | { existing_count: number | string; inserted_count: number | string }
      | undefined;
    const existingCount = Number(result?.existing_count ?? -1);
    const insertedCount = Number(result?.inserted_count ?? 0);

    if (existingCount !== 0) {
      return { ok: false, status: 409, error: "Password setup has already been completed." };
    }
    if (insertedCount !== 2) {
      return { ok: false, status: 503, error: "Password setup could not be completed. Try again once." };
    }

    return { ok: true };
  } catch {
    return { ok: false, status: 503, error: "Password setup is temporarily unavailable." };
  }
}

export async function isPasswordSetupComplete(): Promise<boolean | null> {
  try {
    const rows = await db()`
      SELECT COUNT(*)::int AS count
      FROM auth_passwords
    `;
    const count = Number((rows[0] as { count: number | string } | undefined)?.count ?? 0);
    return count > 0;
  } catch {
    return null;
  }
}

export { MIN_PASSWORD_LENGTH };
