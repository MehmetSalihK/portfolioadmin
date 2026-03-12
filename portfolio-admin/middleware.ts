import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/utils/rateLimit';

// Initialize rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users tracking
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || '127.0.0.1';

  // 1. RATE LIMITING (DDoS Protection)
  // Apply strict limit for Auth API
  if (pathname.startsWith('/api/auth')) {
    const isAllowed = await limiter.checkMiddleware(10, ip + '_auth'); // 10 auth requests per min
    if (!isAllowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  // Apply general limit for other APIs
  else if (pathname.startsWith('/api')) {
    const isAllowed = await limiter.checkMiddleware(100, ip + '_api'); // 100 api requests per min
    if (!isAllowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return NextResponse.next();
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     * This helps reduce Edge Function invocations
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
};