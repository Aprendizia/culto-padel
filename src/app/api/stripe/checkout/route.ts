import { NextRequest, NextResponse } from 'next/server';
import { createTournamentCheckoutSession } from '@/lib/stripe/checkout';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

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

    // Fetch tournament + tenant
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*, tenants!inner(*)')
      .eq('id', tournamentId)
      .single();

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    const tenant = (tournament as Record<string, unknown>).tenants as Record<string, unknown>;
    const stripeAccountId = tenant.stripe_account_id as string;

    if (!stripeAccountId) {
      return NextResponse.json({ error: 'El club no ha configurado pagos' }, { status: 400 });
    }

    // Fetch plan commission rate
    const { data: plan } = await supabase
      .from('plans')
      .select('commission_rate')
      .eq('id', tenant.plan_id as string)
      .single();

    const commissionRate = plan?.commission_rate ?? 0.08;
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
      successUrl: `${appUrl}/tournaments/${tournament.slug}?payment=success`,
      cancelUrl: `${appUrl}/tournaments/${tournament.slug}?payment=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 });
  }
}
