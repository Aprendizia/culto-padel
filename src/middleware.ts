import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_PATHS = ['/dashboard'];
// Routes that require admin role
const ADMIN_PATHS = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Tenant Resolution ---
  // Check subdomain first, then custom domain header
  const host = request.headers.get('host') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appHost = new URL(appUrl).host;

  let tenantSlug: string | null = null;

  // Subdomain resolution: {slug}.cultopadel.com
  if (host !== appHost && !host.startsWith('localhost') && !host.startsWith('www.')) {
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
      tenantSlug = subdomain;
    }
  }

  // Custom domain resolution (via request header set by reverse proxy)
  if (!tenantSlug) {
    const customDomain = request.headers.get('x-custom-domain');
    if (customDomain) {
      // Would look up tenant by custom_domain in practice
      // For now, pass through
      tenantSlug = customDomain;
    }
  }

  // --- Auth Session ---
  const { user, response: supabaseResponse } = await updateSession(request);

  // --- Protected Routes ---
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Pass tenant info via headers ---
  if (tenantSlug) {
    supabaseResponse.headers.set('x-tenant-slug', tenantSlug);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
