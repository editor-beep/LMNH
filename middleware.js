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

export function middleware(request) {
  const ip = (request.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()
  const { pathname } = request.nextUrl

  let allowed = true
  if (pathname === '/new') {
    allowed = isAllowed(ip, 'new', 10, 3_600_000)   // 10 drops/hr
  } else if (pathname.startsWith('/api/')) {
    allowed = isAllowed(ip, 'api', 60, 60_000)        // 60 req/min
  }

  if (!allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/new', '/api/:path*'],
}
