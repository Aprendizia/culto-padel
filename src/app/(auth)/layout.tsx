import { Trophy } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-white">Culto Pádel</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
