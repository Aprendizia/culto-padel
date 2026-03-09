import { NextRequest, NextResponse } from 'next/server';
import { createTournamentCheckoutSession } from '@/lib/stripe/checkout';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { Tournament, Tenant, Plan } from '@/types/database';

const checkoutSchema = z.object({
  tournamentId: z.string().uuid(),
  registrationId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const { tournamentId, registrationId } = parsed.data;

    // Fetch tournament
    const { data: tournamentData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    const tournament = tournamentData as Tournament | null;

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    // Fetch tenant
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tournament.tenant_id)
      .single();

    const tenant = tenantData as Tenant | null;

    if (!tenant) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 });
    }

    const stripeAccountId = tenant.stripe_account_id;

    if (!stripeAccountId) {
      return NextResponse.json({ error: 'El club no ha configurado pagos' }, { status: 400 });
    }

    // Fetch plan commission rate
    let commissionRate = 0.08;
    if (tenant.plan_id) {
      const { data: planData } = await supabase
        .from('plans')
        .select('*')
        .eq('id', tenant.plan_id)
        .single();
      const plan = planData as Plan | null;
      if (plan) commissionRate = plan.commission_rate;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createTournamentCheckoutSession({
      tournamentName: tournament.name,
      entryFee: tournament.entry_fee,
      commissionRate,
      tenantStripeAccountId: stripeAccountId,
      registrationId,
      tournamentId,
      tenantId: tournament.tenant_id,
      playerEmail: user.email || '',
      playerName: user.user_metadata?.full_name || '',
      successUrl: `${appUrl}/t/${tournament.slug}?payment=success`,
      cancelUrl: `${appUrl}/t/${tournament.slug}?payment=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 });
  }
}
