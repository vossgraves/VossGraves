import "server-only";

import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export type AccessRole = "admin" | "private";
type StoredScope = "admin" | "personal";
type SessionRecord = { scope: StoredScope; expires_at: string | Date };
export type SessionIssue = { token: string; expiresAt: Date };

export const SESSION_COOKIE = "vg_session";
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

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    expires: expiresAt,
  };
}

async function requestSubject() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  return digest(`vossgraves:${address}`);
}

async function recordFailure(scope: StoredScope) {
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

async function clearFailures(scope: StoredScope) {
  const sql = db();
  const subjectHash = await requestSubject();
  await sql`DELETE FROM auth_rate_limits WHERE scope = ${scope} AND subject_hash = ${subjectHash}`;
}

async function createSession(scope: StoredScope): Promise<SessionIssue> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await db()`
    INSERT INTO auth_sessions (token_hash, scope, expires_at)
    VALUES (${digest(token)}, ${scope}, ${expiresAt})
  `;
  return { token, expiresAt };
}

async function issueSession(scope: StoredScope) {
  const session = await createSession(scope);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));
  return session;
}

async function verifyPassword(scope: StoredScope, password: string) {
  const rows = await db()`
    SELECT password_hash
    FROM auth_passwords
    WHERE scope = ${scope}
    LIMIT 1
  `;
  const hash = (rows[0] as { password_hash?: string } | undefined)?.password_hash;
  return Boolean(hash && (await argon2.verify(hash, password).catch(() => false)));
}

async function authenticateScope(scope: StoredScope, password: string, setCookie: boolean) {
  if (!password || password.length > 256) {
    return { ok: false as const, error: GENERIC_FAILURE };
  }
  if (!(await verifyPassword(scope, password))) {
    const blocked = await recordFailure(scope);
    return {
      ok: false as const,
      error: blocked ? "Too many attempts. Try again later." : GENERIC_FAILURE,
    };
  }
  await clearFailures(scope);
  const session = setCookie ? await issueSession(scope) : await createSession(scope);
  return setCookie ? { ok: true as const } : { ok: true as const, session };
}

async function authenticatePrivateInternal(password: string, setCookie: boolean) {
  if (!password || password.length > 256) {
    return { ok: false as const, error: GENERIC_FAILURE };
  }
  if (await verifyPassword("personal", password)) {
    await clearFailures("personal");
    const session = setCookie ? await issueSession("personal") : await createSession("personal");
    return setCookie ? { ok: true as const } : { ok: true as const, session };
  }
  if (await verifyPassword("admin", password)) {
    await clearFailures("personal");
    const session = setCookie ? await issueSession("admin") : await createSession("admin");
    return setCookie ? { ok: true as const } : { ok: true as const, session };
  }
  const blocked = await recordFailure("personal");
  return {
    ok: false as const,
    error: blocked ? "Too many attempts. Try again later." : GENERIC_FAILURE,
  };
}

/** Authenticate with the administrator password only. */
export async function authenticate(role: "admin", password: string) {
  const result = await authenticateScope(role, password, true);
  return result.ok ? { ok: true as const } : result;
}

/** Authenticate the private area. The administrator password intentionally also works here. */
export async function authenticatePrivate(password: string) {
  const result = await authenticatePrivateInternal(password, true);
  return result.ok ? { ok: true as const } : result;
}

/** Authenticate for a direct HTTP response so the caller can set the cookie on that response. */
export async function authenticateForRoute(role: "admin", password: string) {
  return authenticateScope(role, password, false);
}

/** Authenticate the private area for a direct HTTP response. */
export async function authenticatePrivateForRoute(password: string) {
  return authenticatePrivateInternal(password, false);
}

export async function getSession(): Promise<SessionRecord | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db()`
    SELECT scope, expires_at
    FROM auth_sessions
    WHERE token_hash = ${digest(token)} AND expires_at > NOW()
    LIMIT 1
  `;
  return (rows[0] as SessionRecord | undefined) ?? null;
}

/** An admin session intentionally also grants access to the personal area. */
export async function hasPrivateAccess() {
  const session = await getSession();
  return session?.scope === "admin" || session?.scope === "personal";
}

export async function hasAdminAccess() {
  return (await getSession())?.scope === "admin";
}

export async function requireScope(scope: StoredScope) {
  const session = await getSession();
  if (!session || (scope === "admin" && session.scope !== "admin")) redirect("/");
  return session;
}

export async function revokeAll() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db()`DELETE FROM auth_sessions WHERE token_hash = ${digest(token)}`;
  }
  cookieStore.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(new Date(0)),
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function signOut() {
  await revokeAll();
}

/** Replace a valid admin session with a lower-privilege personal session. */
export async function downgradeToPrivate() {
  const session = await getSession();
  if (session?.scope !== "admin") return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db()`DELETE FROM auth_sessions WHERE token_hash = ${digest(token)}`;
  }
  await issueSession("personal");
  return true;
}
