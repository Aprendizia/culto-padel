import type { Metadata } from 'next';
import { Inter, Oswald, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { ToastContainer } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

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
      <body className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable} bg-cult-black text-cult-cream antialiased`}>
        <SupabaseProvider>
          {children}
          <ToastContainer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
