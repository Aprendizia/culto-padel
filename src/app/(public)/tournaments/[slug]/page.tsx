'use client';

import { use, useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, DollarSign, Trophy, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationForm } from '@/components/tournaments/registration-form';
import { BracketView } from '@/components/tournaments/bracket-view';
import { Leaderboard } from '@/components/tournaments/leaderboard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/hooks/use-auth';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils';
import type { Tournament, Match, TournamentRegistration } from '@/types/database';
import Link from 'next/link';

type Props = { params: Promise<{ slug: string }> };

export default function PublicTournamentPage({ params }: Props) {
  const { slug } = use(params);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)
        .single();

      if (!tournamentData) {
        setLoading(false);
        return;
      }

      const [matchesData, registrationsData] = await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', tournamentData.id)
          .order('round')
          .order('match_number'),
        supabase
          .from('tournament_registrations')
          .select('*')
          .eq('tournament_id', tournamentData.id)
          .in('status', ['confirmed', 'paid'])
          .order('registered_at'),
      ]);

      setTournament(tournamentData);
      setMatches(matchesData.data || []);
      setRegistrations(registrationsData.data || []);
      setLoading(false);
    };

    fetchTournament();
  }, [supabase, slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse" />
          <div className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-zinc-100">Torneo no encontrado</h1>
          <p className="text-zinc-400 mt-2">El torneo que buscas no existe o no está disponible públicamente</p>
          <Link href="/tournaments" className="mt-4 inline-block">
            <Button variant="outline">Ver todos los torneos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    draft: { label: 'Borrador', variant: 'default' as const },
    registration: { label: 'Inscripciones abiertas', variant: 'success' as const },
    active: { label: 'En curso', variant: 'info' as const },
    paused: { label: 'Pausado', variant: 'warning' as const },
    completed: { label: 'Finalizado', variant: 'default' as const },
    canceled: { label: 'Cancelado', variant: 'error' as const },
  };

  const formatLabels = {
    americano: 'Americano',
    mexicano: 'Mexicano',
    mixed_americano: 'Americano Mixto',
    knockout: 'Eliminación directa',
    double_elimination: 'Doble eliminación',
    round_robin: 'Round Robin',
    swiss: 'Suizo',
    league: 'Liga',
  };

  const registrationNames = new Map(
    registrations.map((r) => [r.id, r.team_name || `Equipo ${r.id.slice(0, 8)}`])
  );

  const status = statusConfig[tournament.status];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/tournaments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Todos los torneos
          </Button>
        </Link>
      </div>

      {/* Tournament Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        {tournament.banner_url ? (
          <div className="h-64 md:h-80">
            <img
              src={tournament.banner_url}
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-64 md:h-80 bg-gradient-to-br from-emerald-600 to-emerald-800" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={status.variant} className="bg-white/20 text-white border-white/20">
              {status.label}
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/20">
              {formatLabels[tournament.format as keyof typeof formatLabels] || tournament.format}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{tournament.name}</h1>
          {tournament.description && (
            <p className="text-lg text-white/90 max-w-2xl">{tournament.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tournament Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                Información del Torneo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournament.start_date && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span>Inicia: {formatDateTime(tournament.start_date)}</span>
                  </div>
                )}
                {tournament.registration_deadline && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span>Inscripciones hasta: {formatDateTime(tournament.registration_deadline)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-300">
                  <Users className="h-4 w-4 text-zinc-500" />
                  <span>
                    {tournament.current_registrations} inscritos
                    {tournament.max_teams && ` / ${tournament.max_teams} máximo`}
                  </span>
                </div>
                {tournament.entry_fee > 0 && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">
                      Inscripción: {formatCurrency(tournament.entry_fee)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bracket / Matches */}
          {tournament.status === 'active' && matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {['knockout', 'double_elimination'].includes(tournament.format) ? 'Bracket' : 'Clasificación'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {['knockout', 'double_elimination'].includes(tournament.format) ? (
                  <BracketView matches={matches} registrations={registrationNames} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-400">Los resultados se actualizan conforme avanza el torneo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Registrations List */}
          {registrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Participantes ({registrations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {registrations.map((reg, index) => (
                    <div key={reg.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-zinc-100">
                          {reg.team_name || `Equipo ${reg.id.slice(0, 8)}`}
                        </p>
                        {reg.seed && (
                          <p className="text-sm text-zinc-400">Seed #{reg.seed}</p>
                        )}
                      </div>
                      <Badge variant="success" className="text-xs">
                        Confirmado
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RegistrationForm tournament={tournament} isLoggedIn={!!user} />

          {/* Tournament Rules */}
          {tournament.rules && Object.keys(tournament.rules).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reglas del Torneo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-zinc-300 space-y-2">
                  <p>• Puntos por partido: {tournament.scoring_system?.points_per_match || 32}</p>
                  <p>• Duración por ronda: {tournament.round_duration_minutes} minutos</p>
                  {tournament.max_teams && (
                    <p>• Máximo de equipos: {tournament.max_teams}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prize Pool */}
          {tournament.prize_pool && Object.keys(tournament.prize_pool).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Premios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(tournament.prize_pool).map(([position, amount]) => (
                    <div key={position} className="flex justify-between">
                      <span className="text-zinc-300 capitalize">{position} lugar:</span>
                      <span className="font-medium text-emerald-400">
                        {formatCurrency(amount as number)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}