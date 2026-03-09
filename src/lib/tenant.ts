import { createClient } from '@supabase/supabase-js';
import type { TenantConfig } from '@/types/database';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function resolveTenant(slug?: string, domain?: string): Promise<TenantConfig | null> {
  const { data, error } = await supabaseAdmin.rpc('resolve_tenant', {
    p_slug: slug || null,
    p_domain: domain || null,
  });
  if (error || !data) return null;
  return data as TenantConfig;
}

export async function getTenantBySlug(slug: string): Promise<TenantConfig | null> {
  return resolveTenant(slug);
}

export async function getTenantByDomain(domain: string): Promise<TenantConfig | null> {
  return resolveTenant(undefined, domain);
}
