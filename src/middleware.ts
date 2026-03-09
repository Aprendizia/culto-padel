import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Known custom domain → slug mappings (MVP — full DB lookup later)
const CUSTOM_DOMAIN_MAP: Record<string, string> = {
  'cpam.com.mx': 'cpam',
  'www.cpam.com.mx': 'cpam',
};

// Routes that require authentication
const PROTECTED_PATHS = ['/courts', '/players', '/settings', '/tournaments/new'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Tenant Resolution ---
  const host = request.headers.get('host') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appHost = new URL(appUrl).host;

  let tenantSlug: string | null = null;
  let tenantId: string | null = null;

  // 1. Subdomain resolution: {slug}.cultopadel.com
  if (host !== appHost && !host.startsWith('localhost') && !host.startsWith('www.')) {
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
      tenantSlug = subdomain;
    }
  }

  // 2. Custom domain resolution via static map
  if (!tenantSlug && CUSTOM_DOMAIN_MAP[host]) {
    tenantSlug = CUSTOM_DOMAIN_MAP[host];
  }

  // 3. Custom domain header (from reverse proxy)
  if (!tenantSlug) {
    const customDomain = request.headers.get('x-custom-domain');
    if (customDomain && CUSTOM_DOMAIN_MAP[customDomain]) {
      tenantSlug = CUSTOM_DOMAIN_MAP[customDomain];
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

  // --- Pass tenant info via response headers (for server components) ---
  if (tenantSlug) {
    supabaseResponse.headers.set('x-tenant-slug', tenantSlug);
  }
  if (tenantId) {
    supabaseResponse.headers.set('x-tenant-id', tenantId);
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
     * - public folder assets
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
