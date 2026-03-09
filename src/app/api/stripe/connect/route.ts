import { NextRequest, NextResponse } from 'next/server';
import { createConnectAccount, createOnboardingLink, getAccountStatus } from '@/lib/stripe/connect';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify user is tenant admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || !['tenant_owner', 'tenant_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    // Get tenant
    const adminClient = createAdminClient();
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('*')
      .eq('id', profile.tenant_id)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If no Stripe account yet, create one
    if (!tenant.stripe_account_id) {
      const account = await createConnectAccount(
        tenant.name,
        tenant.email || user.email || ''
      );

      // Save to tenant
      await adminClient
        .from('tenants')
        .update({ stripe_account_id: account.id })
        .eq('id', tenant.id);

      // Generate onboarding link
      const link = await createOnboardingLink(
        account.id,
        `${appUrl}/dashboard/settings`
      );

      return NextResponse.json({ url: link.url, accountId: account.id });
    }

    // If account exists, check status or return onboarding link
    const status = await getAccountStatus(tenant.stripe_account_id);

    if (!status.detailsSubmitted) {
      const link = await createOnboardingLink(
        tenant.stripe_account_id,
        `${appUrl}/dashboard/settings`
      );
      return NextResponse.json({ url: link.url, accountId: tenant.stripe_account_id, status });
    }

    return NextResponse.json({ accountId: tenant.stripe_account_id, status });
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.json({ error: 'Error al configurar Stripe Connect' }, { status: 500 });
  }
}
