import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/tournaments/[id]
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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
      .eq('id', id)
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

// PATCH /api/tournaments/[id]
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tournament });
  } catch (error) {
    console.error('Update tournament error:', error);
    return NextResponse.json({ error: 'Error al actualizar torneo' }, { status: 500 });
  }
}

// DELETE /api/tournaments/[id]
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete tournament error:', error);
    return NextResponse.json({ error: 'Error al eliminar torneo' }, { status: 500 });
  }
}
