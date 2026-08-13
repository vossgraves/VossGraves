import { NextResponse } from "next/server";
import { initializePasswords } from "@/lib/setup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const payload = body as { adminPassword?: unknown; personalPassword?: unknown };
  if (typeof payload.adminPassword !== "string" || typeof payload.personalPassword !== "string") {
    return NextResponse.json(
      { ok: false, error: "Enter both passwords." },
      { status: 400 },
    );
  }

  const result = await initializePasswords(
    request.headers.get("x-setup-token"),
    payload.adminPassword,
    payload.personalPassword,
  );

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
