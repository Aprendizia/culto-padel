import Link from 'next/link';
import { Calendar, Users, DollarSign, Trophy, MapPin } from 'lucide-react';
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
  
  // Calculate spots left if max_teams is set
  const spotsLeft = tournament.max_teams 
    ? tournament.max_teams - tournament.current_registrations 
    : null;

  return (
    <Wrapper href={href || '#'} className="block group">
      <Card className="transition-all hover:border-cult-gold hover:shadow-lg hover:shadow-cult-gold/10 group-hover:bg-cult-dark/80">
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
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-oswald uppercase tracking-wider text-xs">
                {formatLabels[tournament.format] || tournament.format}
              </Badge>
              {spotsLeft !== null && spotsLeft <= 4 && (
                <Badge variant="error" className="text-xs font-oswald uppercase">
                  {spotsLeft} lugares
                </Badge>
              )}
            </div>
            <Badge variant={status.variant} className="font-oswald uppercase tracking-wider text-xs">
              {status.label}
            </Badge>
          </div>

          <h3 className="text-lg font-oswald font-bold text-cult-cream mb-3 uppercase tracking-wide group-hover:text-cult-gold transition-colors line-clamp-2">
            {tournament.name}
          </h3>

          <div className="space-y-2 mb-4">
            {tournament.start_date && (
              <div className="flex items-center gap-1.5 text-sm text-cult-light">
                <Calendar className="h-3.5 w-3.5 text-cult-gold" />
                <span>{formatDate(tournament.start_date)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {tournament.max_teams && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-cult-light mb-1 font-oswald uppercase tracking-wider">
                <span>Inscritos</span>
                <span>{tournament.current_registrations}/{tournament.max_teams}</span>
              </div>
              <div className="w-full bg-cult-medium rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    spotsLeft !== null && spotsLeft <= 4 ? 'bg-error' : 'bg-cult-gold'
                  }`}
                  style={{ width: `${(tournament.current_registrations / tournament.max_teams) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-cult-medium">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cult-light" />
              <span className="text-cult-light text-sm">
                {tournament.current_registrations} inscritos
              </span>
            </div>
            {tournament.entry_fee > 0 && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-cult-gold" />
                <span className="text-cult-gold font-bold font-jetbrains">
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