import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Resolve tenant from middleware header
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');

  let tenantName: string | null = null;
  let tenantLogoUrl: string | null = null;

  if (tenantSlug) {
    const supabase = await createClient();
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, logo_url')
      .eq('slug', tenantSlug)
      .single();

    if (tenant) {
      tenantName = (tenant as { name: string; logo_url: string | null }).name;
      tenantLogoUrl = (tenant as { name: string; logo_url: string | null }).logo_url;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cult-black">
      <Navbar tenantName={tenantName} tenantLogoUrl={tenantLogoUrl} />
      <main className="flex-1">{children}</main>
      <Footer tenantName={tenantName} />
    </div>
  );
}
