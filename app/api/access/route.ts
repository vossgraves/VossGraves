import { NextResponse } from "next/server";
import { authenticate, authenticatePrivate } from "@/lib/access";

export const runtime = "nodejs";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { mode?: unknown; password?: unknown };
    const mode = body.mode === "admin" || body.mode === "private" ? body.mode : null;
    const password = typeof body.password === "string" ? body.password : "";

    if (!mode || !password) {
      return NextResponse.json(
        { ok: false, error: "The access code is invalid or temporarily unavailable." },
        { status: 400 },
      );
    }

    const result = mode === "admin" ? await authenticate("admin", password) : await authenticatePrivate(password);
    return NextResponse.json(result, {
      status: result.ok ? 200 : 401,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "The access code is invalid or temporarily unavailable." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
