import Link from 'next/link';
import { Calendar, Users, DollarSign, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Tournament, TournamentStatus } from '@/types/database';

const statusConfig: Record<TournamentStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  draft: { label: 'Borrador', variant: 'default' },
  registration: { label: 'Inscripciones abiertas', variant: 'success' },
  active: { label: 'En curso', variant: 'info' },
  paused: { label: 'Pausado', variant: 'warning' },
  completed: { label: 'Finalizado', variant: 'default' },
  canceled: { label: 'Cancelado', variant: 'error' },
};

const formatLabels: Record<string, string> = {
  americano: 'Americano',
  mexicano: 'Mexicano',
  mixed_americano: 'Americano Mixto',
  knockout: 'Eliminación directa',
  double_elimination: 'Doble eliminación',
  round_robin: 'Round Robin',
  swiss: 'Suizo',
  league: 'Liga',
};

interface TournamentCardProps {
  tournament: Tournament;
  href?: string;
}

export function TournamentCard({ tournament, href }: TournamentCardProps) {
  const status = statusConfig[tournament.status];
  const Wrapper = href ? Link : 'div';

  return (
    <Wrapper href={href || '#'} className="block group">
      <Card className="transition-all hover:border-zinc-700 hover:shadow-lg group-hover:bg-zinc-900/80">
        {tournament.banner_url && (
          <div className="h-40 overflow-hidden rounded-t-xl">
            <img
              src={tournament.banner_url}
              alt={tournament.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className={tournament.banner_url ? 'pt-4' : 'pt-6'}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-lg font-semibold text-zinc-100 line-clamp-1">
              {tournament.name}
            </h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="flex items-center gap-1.5 mb-1 text-sm text-zinc-400">
            <Trophy className="h-3.5 w-3.5" />
            <span>{formatLabels[tournament.format] || tournament.format}</span>
          </div>

          {tournament.start_date && (
            <div className="flex items-center gap-1.5 mb-1 text-sm text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(tournament.start_date)}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-zinc-300">
                {tournament.current_registrations}
                {tournament.max_teams && ` / ${tournament.max_teams}`}
              </span>
            </div>
            {tournament.entry_fee > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-emerald-400 font-medium">
                  {formatCurrency(tournament.entry_fee)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  );
}
