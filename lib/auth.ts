import "server-only";

import argon2 from "argon2";
import { db } from "./db";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export type AccessScope = "admin" | "personal";

type SessionRecord = { scope: AccessScope; expires_at: string | Date };

const SESSION_COOKIE = "vg_session";
const SESSION_TTL_SECONDS = Math.max(
  300,
  Number.parseInt(process.env.AUTH_SESSION_TTL_SECONDS ?? "1800", 10) || 1800,
);
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const GENERIC_FAILURE = "The access code is invalid or temporarily unavailable.";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

async function requestSubject() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  return digest(`vossgraves:${address}`);
}

async function recordFailure(scope: AccessScope) {
  const sql = db();
  const subjectHash = await requestSubject();
  const rows = await sql`
    SELECT window_started_at, failures, blocked_until
    FROM auth_rate_limits
    WHERE scope = ${scope} AND subject_hash = ${subjectHash}
    LIMIT 1
  `;
  const row = rows[0] as
    | { window_started_at: string | Date; failures: number; blocked_until: string | Date | null }
    | undefined;
  const now = Date.now();
  const windowStarted = row ? new Date(row.window_started_at).getTime() : 0;
  const blockedUntil = row?.blocked_until ? new Date(row.blocked_until).getTime() : 0;

  if (blockedUntil > now) return true;
  if (!row || now - windowStarted >= WINDOW_MS) {
    await sql`
      INSERT INTO auth_rate_limits (scope, subject_hash, window_started_at, failures, blocked_until)
      VALUES (${scope}, ${subjectHash}, NOW(), 1, NULL)
      ON CONFLICT (scope, subject_hash) DO UPDATE SET
        window_started_at = NOW(), failures = 1, blocked_until = NULL
    `;
    return false;
  }

  const failures = Number(row.failures) + 1;
  const nextBlockedUntil = failures >= MAX_FAILURES ? new Date(now + WINDOW_MS) : null;
  await sql`
    UPDATE auth_rate_limits
    SET failures = ${failures}, blocked_until = ${nextBlockedUntil}
    WHERE scope = ${scope} AND subject_hash = ${subjectHash}
  `;
  return Boolean(nextBlockedUntil);
}

export async function authenticate(scope: AccessScope, password: string) {
  if (!password || password.length > 256) {
    return { ok: false as const, message: GENERIC_FAILURE };
  }

  const sql = db();
  const rows = await sql`
    SELECT password_hash
    FROM auth_passwords
    WHERE scope = ${scope}
    LIMIT 1
  `;
  const storedHash = (rows[0] as { password_hash?: string } | undefined)?.password_hash;
  const valid = Boolean(storedHash && (await argon2.verify(storedHash, password).catch(() => false)));

  if (!valid) {
    const blocked = await recordFailure(scope);
    return {
      ok: false as const,
      message: blocked ? "Too many attempts. Try again later." : GENERIC_FAILURE,
    };
  }

  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await sql`
    INSERT INTO auth_sessions (token_hash, scope, expires_at)
    VALUES (${digest(token)}, ${scope}, ${expiresAt})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    expires: expiresAt,
  });

  return { ok: true as const };
}

export async function getSession(): Promise<SessionRecord | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sql = db();
  const rows = await sql`
    SELECT scope, expires_at
    FROM auth_sessions
    WHERE token_hash = ${digest(token)} AND expires_at > NOW()
    LIMIT 1
  `;
  return (rows[0] as SessionRecord | undefined) ?? null;
}

export async function requireScope(scope: AccessScope) {
  const session = await getSession();
  if (!session || (scope === "admin" && session.scope !== "admin")) redirect("/");
  return session;
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db()`DELETE FROM auth_sessions WHERE token_hash = ${digest(token)}`;
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
