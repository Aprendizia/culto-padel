import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const registerSchema = z.object({
  player2Id: z.string().uuid().optional(),
  teamName: z.string().optional(),
});

type RouteContext = { params: Promise<{ tournamentId: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { tournamentId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Fetch tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    if (tournament.status !== 'registration') {
      return NextResponse.json({ error: 'El torneo no está en periodo de registro' }, { status: 400 });
    }

    if (tournament.max_teams && tournament.current_registrations >= tournament.max_teams) {
      return NextResponse.json({ error: 'El torneo está lleno' }, { status: 400 });
    }

    // Check for existing registration
    const { data: existing } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('player_1_id', user.id)
      .not('status', 'in', '("withdrawn","disqualified")')
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Ya estás registrado en este torneo' }, { status: 409 });
    }

    // Get profile for tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // Create registration
    const status = tournament.entry_fee > 0 ? 'pending' : 'confirmed';

    const { data: registration, error } = await supabase
      .from('tournament_registrations')
      .insert({
        tenant_id: profile.tenant_id,
        tournament_id: tournamentId,
        player_1_id: user.id,
        player_2_id: parsed.data.player2Id,
        team_name: parsed.data.teamName,
        status,
        payment_status: tournament.entry_fee > 0 ? 'pending' : 'succeeded',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error al registrarse' }, { status: 500 });
  }
}