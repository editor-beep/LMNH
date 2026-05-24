import { NextResponse } from 'next/server'

// In-memory rate limiter — resets on cold start.
// For production across multiple edge instances, replace with Upstash Redis.
const store = new Map()

function isAllowed(ip, route, limit, windowMs) {
  const key = `${ip}:${route}`
  const now = Date.now()
  const entry = store.get(key) ?? { count: 0, resetAt: now + windowMs }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + windowMs
  }
  entry.count++
  store.set(key, entry)
  return entry.count <= limit
}

function withSecurityHeaders(response) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
  )
  return response
}

function isSensitivePath(pathname) {
  return [
    '/.env',
    '/.env.local',
    '/.git',
    '/.git/config',
    '/phpinfo.php',
    '/wp-config.php',
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function middleware(request) {
  const ip = (request.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()
  const { pathname } = request.nextUrl

  if (isSensitivePath(pathname)) {
    return withSecurityHeaders(new NextResponse('Not Found', { status: 404 }))
  }

  let allowed = true
  if (pathname === '/new') {
    allowed = isAllowed(ip, 'new', 10, 3_600_000) // 10 drops/hr
  } else if (pathname.startsWith('/api/')) {
    allowed = isAllowed(ip, 'api', 60, 60_000) // 60 req/min
  }

  if (!allowed) {
    const res = new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
    })
    return withSecurityHeaders(res)
  }

  const response = NextResponse.next()

  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    if (origin && origin === request.nextUrl.origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Vary', 'Origin')
  }

  return withSecurityHeaders(response)
}

export const config = {
  matcher: '/:path*',
}
