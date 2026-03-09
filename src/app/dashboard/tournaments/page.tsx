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
          <h1 className="text-3xl font-oswald font-bold text-cult-cream uppercase tracking-wide">Torneos</h1>
          <div className="h-10 w-32 bg-cult-dark rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-cult-dark rounded-xl animate-pulse border border-cult-medium" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-cult-cream uppercase tracking-wide">Torneos</h1>
          <p className="text-cult-light mt-1">Gestiona todos tus torneos</p>
        </div>
        <Link href="/dashboard/tournaments/new">
          <Button variant="primary" className="bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Torneo
          </Button>
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-dark mb-4">
            <Plus className="h-8 w-8 text-cult-light" />
          </div>
          <h3 className="text-lg font-oswald font-bold text-cult-cream mb-2 uppercase">No hay torneos aún</h3>
          <p className="text-cult-light mb-6">Crea tu primer torneo para comenzar</p>
          <Link href="/dashboard/tournaments/new">
            <Button variant="primary" className="bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase">
              Crear Torneo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              href={`/dashboard/tournaments/${tournament.id}`}
              variant="admin"
            />
          ))}
        </div>
      )}
    </div>
  );
}
