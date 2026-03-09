import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { Trophy, Search } from 'lucide-react';
import { TournamentFilters } from './filters';

export default async function PublicTournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; format?: string }>;
}) {
  const params = await searchParams;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');

  const supabase = await createClient();

  // Resolve tenant
  let tenantId: string | null = null;
  if (tenantSlug) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', tenantSlug)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tenantId = (tenant as any)?.id || null;
  }

  // Build query
  let query = supabase
    .from('tournaments')
    .select('*')
    .eq('is_public', true)
    .order('start_date', { ascending: true });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  // Filter by status
  if (params.status === 'registration') {
    query = query.eq('status', 'registration');
  } else if (params.status === 'active') {
    query = query.eq('status', 'active');
  } else if (params.status === 'completed') {
    query = query.eq('status', 'completed');
  } else {
    // Default: show open + active
    query = query.in('status', ['registration', 'active', 'completed']);
  }

  if (params.format) {
    query = query.eq('format', params.format);
  }

  const { data: tournaments } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = (tournaments || []) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-oswald font-bold text-cult-gold mb-4 uppercase tracking-wide">
          Torneos del Culto
        </h1>
        <p className="text-lg text-cult-light">
          Los elegidos compiten aquí. ¿Estás listo para demostrar tu devoción?
        </p>
      </div>

      {/* Filters */}
      <TournamentFilters currentStatus={params.status} currentFormat={params.format} />

      {/* Count */}
      <div className="mb-6">
        <p className="text-sm text-cult-light font-oswald uppercase tracking-wider">
          {list.length} torneo{list.length !== 1 ? 's' : ''} encontrado{list.length !== 1 ? 's' : ''}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-dark mb-4">
            <Search className="h-8 w-8 text-cult-light" />
          </div>
          <h3 className="text-lg font-oswald font-bold text-cult-cream mb-2 uppercase">
            No se encontraron torneos
          </h3>
          <p className="text-cult-light">
            La orden aún no ha programado eventos con estos criterios
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              href={`/t/${tournament.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
