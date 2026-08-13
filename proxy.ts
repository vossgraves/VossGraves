import { NextResponse, type NextRequest } from 'next/server'

// Fast, edge-level pre-filter. It only checks for the *presence* of the access
// cookies to avoid obviously-unauthorized requests reaching the routes. The
// authoritative validation (token exists in Neon and is unexpired) happens in
// each route's server component, so a forged/expired cookie still can't get in.
const ADMIN_COOKIE = 'vg_ak'
const PRIVATE_COOKIE = 'vg_pk'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasAdmin = Boolean(req.cookies.get(ADMIN_COOKIE)?.value)
  const hasPrivate = hasAdmin || Boolean(req.cookies.get(PRIVATE_COOKIE)?.value)

  if (pathname.startsWith('/admin') && !hasAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  if (pathname === '/personal' && !hasPrivate) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/personal', '/admin/:path*'],
}
