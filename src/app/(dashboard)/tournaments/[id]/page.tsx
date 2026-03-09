'use client';

import { use } from 'react';
import { ArrowLeft, Play, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BracketView } from '@/components/tournaments/bracket-view';
import { Leaderboard } from '@/components/tournaments/leaderboard';
import { ScoreEntry } from '@/components/tournaments/score-entry';
import { useTournament } from '@/hooks/use-tournament';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import Link from 'next/link';

type Props = { params: Promise<{ id: string }> };

export default function TournamentDetailPage({ params }: Props) {
  const { id } = use(params);
  const { tournament, matches, registrations, loading } = useTournament(id);

  const generateBracket = async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}/bracket`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast({ title: 'Bracket generado', variant: 'success' });
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error', description: message, variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse" />
        <div className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-zinc-100">Torneo no encontrado</h1>
      </div>
    );
  }

  // Create registration name map
  const registrationNames = new Map(
    registrations.map((r) => [r.id, r.team_name || `Equipo ${r.id.slice(0, 8)}`])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torneos
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-100">{tournament.name}</h1>
          {tournament.description && (
            <p className="text-zinc-400 mt-1">{tournament.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={tournament.status === 'active' ? 'success' : 'default'}>
            {tournament.status === 'draft' && 'Borrador'}
            {tournament.status === 'registration' && 'Inscripciones'}
            {tournament.status === 'active' && 'En curso'}
            {tournament.status === 'completed' && 'Finalizado'}
          </Badge>
          {tournament.status === 'draft' && registrations.length >= 2 && (
            <Button variant="primary" onClick={generateBracket}>
              <Play className="h-4 w-4 mr-2" />
              Generar Bracket
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-sm text-zinc-400">Formato</p>
              <p className="font-medium text-zinc-100 capitalize">{tournament.format}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-zinc-400">Participantes</p>
              <p className="font-medium text-zinc-100">
                {tournament.current_registrations}
                {tournament.max_teams && ` / ${tournament.max_teams}`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-sm text-zinc-400">Inicio</p>
              <p className="font-medium text-zinc-100">
                {tournament.start_date ? formatDate(tournament.start_date) : 'Por definir'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              $
            </div>
            <div>
              <p className="text-sm text-zinc-400">Inscripción</p>
              <p className="font-medium text-zinc-100">
                {tournament.entry_fee > 0 ? formatCurrency(tournament.entry_fee) : 'Gratis'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content based on format and status */}
      {tournament.status === 'active' && matches.length > 0 && (
        <>
          {['knockout', 'double_elimination'].includes(tournament.format) ? (
            <Card>
              <CardHeader>
                <CardTitle>Bracket</CardTitle>
              </CardHeader>
              <CardContent>
                <BracketView matches={matches} registrations={registrationNames} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Partidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matches.slice(0, 5).map((match) => (
                    <ScoreEntry
                      key={match.id}
                      match={match}
                      tournamentId={tournament.id}
                      teamAName={
                        registrationNames.get(match.team_a_registration_id!) || 'Equipo A'
                      }
                      teamBName={
                        registrationNames.get(match.team_b_registration_id!) || 'Equipo B'
                      }
                      pointsPerMatch={tournament.scoring_system?.points_per_match}
                    />
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Posiciones</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Leaderboard would be calculated from matches */}
                  <p className="text-zinc-400 text-sm">
                    Las posiciones se actualizan automáticamente con los resultados
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Inscripciones ({registrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No hay inscripciones aún</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                  <div>
                    <p className="font-medium text-zinc-100">
                      {reg.team_name || `Equipo ${reg.id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {reg.status === 'paid' ? 'Confirmado' : 'Pendiente'}
                    </p>
                  </div>
                  <Badge variant={reg.status === 'paid' ? 'success' : 'warning'}>
                    {reg.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}