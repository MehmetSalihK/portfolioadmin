import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/utils/rateLimit';

// Initialize rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users tracking
});

// Fonction pour vérifier le statut de maintenance
async function getMaintenanceStatus(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const response = await fetch(`${origin}/api/maintenance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
  }
  return { isEnabled: false };
}

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

  // Exclure les routes API, les assets statiques et les routes d'admin
  const excludedPaths = [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/admin/',
    '/maintenance'
  ];

  const isExcluded = excludedPaths.some(path => pathname.startsWith(path));

  if (isExcluded) {
    return NextResponse.next();
  }

  // Vérifier le statut de maintenance
  const maintenanceStatus = await getMaintenanceStatus(request);

  if (maintenanceStatus.isEnabled) {
    // Vérifier si l'IP est dans la liste des IPs autorisées
    const clientIP = ip; // 'ip' is already defined at the top of middleware
    
    const allowedIPs = maintenanceStatus.allowedIPs || [];
    const isIPAllowed = allowedIPs.includes(clientIP);
    
    if (!isIPAllowed) {
      // Rediriger vers la page de maintenance
      const maintenanceUrl = new URL('/maintenance', request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  }
  
  return NextResponse.next();
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};