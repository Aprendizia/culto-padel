import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { ToastContainer } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Culto Pádel — Plataforma de torneos de pádel',
  description:
    'Organiza torneos de pádel, gestiona inscripciones, brackets y rankings. La plataforma todo-en-uno para clubes de pádel.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <SupabaseProvider>
          {children}
          <ToastContainer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
