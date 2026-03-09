'use client';

import { useState, useEffect } from 'react';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useSupabase } from '@/components/providers/supabase-provider';
import type { Tournament } from '@/types/database';
import { Search } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'registration', label: 'Inscripciones abiertas' },
  { value: 'active', label: 'En curso' },
  { value: 'completed', label: 'Finalizados' },
];

const formatOptions = [
  { value: '', label: 'Todos los formatos' },
  { value: 'americano', label: 'Americano' },
  { value: 'mexicano', label: 'Mexicano' },
  { value: 'knockout', label: 'Eliminación directa' },
  { value: 'round_robin', label: 'Round Robin' },
];

export default function PublicTournamentsPage() {
  const { supabase } = useSupabase();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      let query = supabase
        .from('tournaments')
        .select('*')
        .eq('is_public', true)
        .order('start_date', { ascending: true });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (formatFilter) {
        query = query.eq('format', formatFilter);
      }

      const { data } = await query;
      setTournaments(data || []);
      setLoading(false);
    };

    fetchTournaments();
  }, [supabase, statusFilter, formatFilter]);

  // Filter tournaments by search
  const filteredTournaments = tournaments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-zinc-100 mb-4">Torneos Públicos</h1>
        <p className="text-lg text-zinc-400">
          Encuentra y participa en torneos de pádel cerca de ti
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar torneos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Estado"
        />
        <Select
          options={formatOptions}
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          placeholder="Formato"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          <div className="mb-6">
            <p className="text-sm text-zinc-400">
              {filteredTournaments.length} torneo{filteredTournaments.length !== 1 ? 's' : ''} encontrado{filteredTournaments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredTournaments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">No se encontraron torneos</h3>
              <p className="text-zinc-500">
                Intenta ajustar los filtros o buscar algo diferente
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  href={`/tournaments/${tournament.slug}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}