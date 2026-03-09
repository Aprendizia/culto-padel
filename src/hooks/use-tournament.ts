'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import type { Tournament, Match, TournamentRegistration } from '@/types/database';

interface UseTournamentReturn {
  tournament: Tournament | null;
  matches: Match[];
  registrations: TournamentRegistration[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTournament(tournamentId: string): UseTournamentReturn {
  const { supabase } = useSupabase();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournament = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tournamentRes, matchesRes, registrationsRes] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', tournamentId).single(),
        supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('round', { ascending: true })
          .order('match_number', { ascending: true }),
        supabase
          .from('tournament_registrations')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('registered_at', { ascending: true }),
      ]);

      if (tournamentRes.error) throw tournamentRes.error;

      setTournament(tournamentRes.data);
      setMatches(matchesRes.data || []);
      setRegistrations(registrationsRes.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error loading tournament';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase, tournamentId]);

  useEffect(() => {
    fetchTournament();

    // Subscribe to real-time match updates
    const channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchTournament();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTournament, supabase, tournamentId]);

  return { tournament, matches, registrations, loading, error, refetch: fetchTournament };
}
