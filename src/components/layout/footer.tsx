import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-cult-medium bg-cult-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-cult-gold flex items-center justify-center">
              <Trophy className="h-3 w-3 text-cult-black" />
            </div>
            <span className="text-lg font-oswald font-bold text-cult-gold uppercase tracking-wide">
              CULTO PÁDEL
            </span>
          </div>

          <div className="flex gap-6">
            <Link href="/t" className="text-sm text-cult-light hover:text-cult-gold transition-colors uppercase tracking-wide">
              Torneos
            </Link>
            <Link href="/login" className="text-sm text-cult-light hover:text-cult-gold transition-colors uppercase tracking-wide">
              Iniciar sesión
            </Link>
          </div>

          <p className="text-xs text-cult-light font-oswald uppercase tracking-wider">
            © {new Date().getFullYear()} CULTO PÁDEL — Una orden secreta del pádel
          </p>
        </div>
      </div>
    </footer>
  );
}