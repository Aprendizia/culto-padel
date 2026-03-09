'use client';

import Link from 'next/link';
import { Trophy, User, LogIn, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

interface NavbarProps {
  tenantName?: string | null;
  tenantLogoUrl?: string | null;
}

export function Navbar({ tenantName, tenantLogoUrl }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = tenantName || 'CULTO PÁDEL';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-cult-medium bg-cult-black/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {tenantLogoUrl ? (
            <img src={tenantLogoUrl} alt={displayName} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-cult-gold flex items-center justify-center">
              <Trophy className="h-4 w-4 text-cult-black" />
            </div>
          )}
          <span className="text-xl font-oswald font-bold text-cult-gold tracking-wide uppercase">
            {displayName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/t" className="text-sm text-cult-light hover:text-cult-gold transition-colors uppercase tracking-wide font-oswald">
            Torneos
          </Link>
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-cult-light">
                {profile?.display_name || user.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="font-oswald uppercase tracking-wide">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase">
                  <LogIn className="h-4 w-4 mr-2" />
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-cult-light hover:text-cult-gold"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cult-medium bg-cult-black px-4 py-4 space-y-3">
          <Link
            href="/t"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide py-2"
          >
            Torneos
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide py-2"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="block text-sm text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide py-2"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide py-2"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-cult-gold font-oswald font-bold uppercase tracking-wide py-2"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
