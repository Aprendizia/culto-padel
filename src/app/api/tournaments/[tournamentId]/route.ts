import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ tournamentId: string }> };

// GET /api/tournaments/[tournamentId]
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { tournamentId } = await context.params;
    const supabase = await createClient();

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        tournament_categories(name, gender),
        tournament_registrations(
          id, team_name, seed, status, payment_status,
          player_1_id, player_2_id, registered_at
        )
      `)
      .eq('id', tournamentId)
      .single();

    if (error || !tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ tournament });
  } catch (error) {
    console.error('Get tournament error:', error);
    return NextResponse.json({ error: 'Error al obtener torneo' }, { status: 500 });
  }
}

// PATCH /api/tournaments/[tournamentId]
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { tournamentId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .update(body)
      .eq('id', tournamentId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tournament });
  } catch (error) {
    console.error('Update tournament error:', error);
    return NextResponse.json({ error: 'Error al actualizar torneo' }, { status: 500 });
  }
}

// DELETE /api/tournaments/[tournamentId]
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { tournamentId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete tournament error:', error);
    return NextResponse.json({ error: 'Error al eliminar torneo' }, { status: 500 });
  }
}