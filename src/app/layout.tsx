import type { Metadata } from 'next';
import { Inter, Oswald, JetBrains_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { TenantProvider } from '@/components/providers/tenant-provider';
import { ToastContainer } from '@/components/ui/toast';
import { resolveTenant } from '@/lib/tenant';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'Culto Pádel — Plataforma de torneos de pádel',
  description:
    'Organiza torneos de pádel, gestiona inscripciones, brackets y rankings. La plataforma todo-en-uno para clubes de pádel.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read tenant slug from header (set by middleware)
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');
  const tenant = tenantSlug ? await resolveTenant(tenantSlug) : null;

  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable} bg-cult-black text-cult-cream antialiased`}>
        <TenantProvider tenant={tenant}>
          <SupabaseProvider>
            {children}
            <ToastContainer />
          </SupabaseProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
