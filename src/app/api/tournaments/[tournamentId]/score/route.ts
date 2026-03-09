import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const scoreSchema = z.object({
  matchId: z.string().uuid(),
  scoreTeamA: z.number().min(0),
  scoreTeamB: z.number().min(0),
  sets: z.array(z.object({ a: z.number(), b: z.number() })).optional(),
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
    const parsed = scoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const { matchId, scoreTeamA, scoreTeamB, sets } = parsed.data;

    // Determine winner
    let winnerSide: 'a' | 'b' | 'draw' = 'draw';
    if (scoreTeamA > scoreTeamB) winnerSide = 'a';
    else if (scoreTeamB > scoreTeamA) winnerSide = 'b';

    // Update match
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: match, error } = await (supabase as any)
      .from('matches')
      .update({
        score_team_a: scoreTeamA,
        score_team_b: scoreTeamB,
        sets: sets || [],
        winner_side: winnerSide,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .eq('tournament_id', tournamentId)
      .select()
      .single();

    if (error) throw error;

    // If this match has a next_match, advance the winner
    if (match.next_match_id && match.next_match_slot) {
      const winnerRegId =
        winnerSide === 'a'
          ? match.team_a_registration_id
          : match.team_b_registration_id;

      if (winnerRegId) {
        const updateField =
          match.next_match_slot === 'a'
            ? { team_a_registration_id: winnerRegId }
            : { team_b_registration_id: winnerRegId };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('matches')
          .update(updateField)
          .eq('id', match.next_match_id);
      }
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Score submission error:', error);
    return NextResponse.json({ error: 'Error al registrar marcador' }, { status: 500 });
  }
}