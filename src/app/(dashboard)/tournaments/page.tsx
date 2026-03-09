'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { useSupabase } from '@/components/providers/supabase-provider';
import type { Tournament } from '@/types/database';

export default function TournamentsPage() {
  const { supabase } = useSupabase();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      setTournaments(data || []);
      setLoading(false);
    };

    fetchTournaments();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-zinc-100">Torneos</h1>
          <div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Torneos</h1>
          <p className="text-zinc-400 mt-1">Gestiona todos tus torneos</p>
        </div>
        <Link href="/dashboard/tournaments/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Torneo
          </Button>
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
            <Plus className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">No hay torneos aún</h3>
          <p className="text-zinc-500 mb-6">Crea tu primer torneo para comenzar</p>
          <Link href="/dashboard/tournaments/new">
            <Button variant="primary">Crear Torneo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              href={`/dashboard/tournaments/${tournament.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}