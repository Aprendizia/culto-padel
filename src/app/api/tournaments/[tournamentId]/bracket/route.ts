import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateKnockoutBracket, bracketMatchesToDbRows } from '@/lib/tournaments/bracket-generator';
import { generateAmericanoSchedule, americanoMatchesToDbRows } from '@/lib/tournaments/americano';

type RouteContext = { params: Promise<{ tournamentId: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { tournamentId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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

    // Fetch confirmed/paid registrations
    const { data: registrations } = await supabase
      .from('tournament_registrations')
      .select('id, seed, team_name, player_1_id, player_2_id')
      .eq('tournament_id', tournamentId)
      .in('status', ['confirmed', 'paid'])
      .order('seed', { ascending: true, nullsFirst: false });

    if (!registrations || registrations.length < 2) {
      return NextResponse.json({ error: 'Se necesitan al menos 2 registros confirmados' }, { status: 400 });
    }

    let matchRows;

    if (['knockout', 'double_elimination'].includes(tournament.format)) {
      // Knockout bracket
      const bracketRegs = registrations.map((r) => ({
        id: r.id,
        seed: r.seed ?? undefined,
        teamName: r.team_name ?? undefined,
        player1Id: r.player_1_id,
        player2Id: r.player_2_id ?? undefined,
      }));

      const matches = generateKnockoutBracket(bracketRegs, tournamentId, tournament.tenant_id);
      matchRows = bracketMatchesToDbRows(matches);
    } else if (['americano', 'mixed_americano', 'team_americano'].includes(tournament.format)) {
      // Americano schedule
      const players = registrations.map((r) => ({
        id: r.player_1_id,
        name: r.team_name || r.player_1_id,
      }));

      const courts = tournament.courts_assigned?.length || 2;
      const pointsPerMatch = tournament.scoring_system?.points_per_match || 32;
      const schedule = generateAmericanoSchedule(players, courts, pointsPerMatch);
      matchRows = americanoMatchesToDbRows(schedule, tournamentId, tournament.tenant_id);
    } else {
      return NextResponse.json({ error: `Formato '${tournament.format}' no soportado aún` }, { status: 400 });
    }

    // Delete existing matches (regeneration)
    await supabase.from('matches').delete().eq('tournament_id', tournamentId);

    // Insert new matches
    const { error } = await supabase.from('matches').insert(matchRows);
    if (error) throw error;

    // Update tournament status
    await supabase
      .from('tournaments')
      .update({ status: 'active' })
      .eq('id', tournamentId);

    return NextResponse.json({
      success: true,
      matchCount: matchRows.length,
      format: tournament.format,
    });
  } catch (error) {
    console.error('Bracket generation error:', error);
    return NextResponse.json({ error: 'Error al generar bracket' }, { status: 500 });
  }
}