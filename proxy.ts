import { NextResponse, type NextRequest } from 'next/server'

// Fast, edge-level pre-filter. It only checks for the *presence* of the
// current session cookie to avoid obviously-unauthorized requests reaching the
// routes. The authoritative validation (token exists in Neon, has the right
// scope, and is unexpired) happens in each route's server component, so a
// forged, expired, or lower-privilege cookie still can't get in.
const SESSION_COOKIE = 'vg_session'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value)

  if ((pathname.startsWith('/admin') || pathname === '/personal') && !hasSession) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/personal', '/admin/:path*'],
}
