import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center">
              <Trophy className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-300">Culto Pádel</span>
          </div>

          <div className="flex gap-6">
            <Link href="/tournaments" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Torneos
            </Link>
            <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Iniciar sesión
            </Link>
          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Culto Pádel. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
