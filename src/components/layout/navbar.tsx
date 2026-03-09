'use client';

import Link from 'next/link';
import { Trophy, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  user?: { email: string; name?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-cult-medium bg-cult-black/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-cult-gold flex items-center justify-center">
            <Trophy className="h-4 w-4 text-cult-black" />
          </div>
          <span className="text-xl font-oswald font-bold text-cult-gold tracking-wide uppercase">
            CULTO PÁDEL
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/t" className="text-sm text-cult-light hover:text-cult-gold transition-colors uppercase tracking-wide">
            Torneos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                {user.name || user.email}
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm" className="uppercase font-oswald font-bold tracking-wide">
                <LogIn className="h-4 w-4 mr-2" />
                Inscribirse
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}