import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fonction pour vérifier le statut de maintenance
async function getMaintenanceStatus(request: NextRequest) {
  try {
    // Utiliser l'URL de la requête pour s'assurer qu'on appelle la bonne API
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/maintenance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      cache: 'no-store',
      next: { revalidate: 0 } // Pour Next.js 13+
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
    const clientIP = request.ip || 
                    request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
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