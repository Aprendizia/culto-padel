import { ArrowLeft, Calendar, Users, DollarSign, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { RegistrationButton } from './registration-button';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'outline' },
  registration: { label: 'Inscripciones abiertas', variant: 'success' },
  active: { label: 'En curso', variant: 'info' },
  paused: { label: 'Pausado', variant: 'warning' },
  completed: { label: 'Finalizado', variant: 'outline' },
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

export default async function PublicTournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');

  const supabase = await createClient();

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();

  // Build query
  const { data: tournamentData } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_categories(name, gender),
      tournament_registrations(
        id, team_name, seed, status, payment_status, registered_at
      )
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tournament = tournamentData as any;

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-oswald font-bold text-cult-cream uppercase">
            Torneo no encontrado
          </h1>
          <p className="text-cult-light mt-2">
            Este evento no existe o no está disponible públicamente
          </p>
          <Link href="/t" className="mt-4 inline-block">
            <Button variant="outline" className="font-oswald uppercase tracking-wide">Ver todos los torneos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[tournament.status] || statusConfig.draft;
  const confirmedRegistrations = (tournament.tournament_registrations || []).filter(
    (r: { status: string }) => ['confirmed', 'paid'].includes(r.status)
  );
  const spotsLeft = tournament.max_teams
    ? tournament.max_teams - tournament.current_registrations
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/t">
          <Button variant="ghost" size="sm" className="text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide">
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
            <div className="absolute inset-0 bg-gradient-to-t from-cult-black/80 via-cult-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-64 md:h-80 bg-gradient-to-br from-cult-gold/20 via-cult-dark to-cult-black" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={status.variant} className="font-oswald uppercase tracking-wider">
              {status.label}
            </Badge>
            <Badge variant="outline" className="bg-cult-black/20 text-cult-cream border-cult-cream/30 font-oswald uppercase tracking-wider">
              {formatLabels[tournament.format as keyof typeof formatLabels] || tournament.format}
            </Badge>
            {tournament.tournament_categories && (
              <Badge variant="outline" className="bg-cult-black/20 text-cult-cream border-cult-cream/30 font-oswald uppercase tracking-wider">
                {(tournament.tournament_categories as { name: string }).name}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-oswald font-bold mb-2 uppercase tracking-wide text-cult-cream">
            {tournament.name}
          </h1>
          {tournament.description && (
            <p className="text-lg text-cult-cream/90 max-w-2xl">{tournament.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tournament Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-oswald uppercase tracking-wider">
                <Trophy className="h-5 w-5 text-cult-gold" />
                Información del Torneo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournament.start_date && (
                  <div className="flex items-center gap-2 text-cult-light">
                    <Calendar className="h-4 w-4 text-cult-gold" />
                    <span>Inicia: {formatDateTime(tournament.start_date)}</span>
                  </div>
                )}
                {tournament.end_date && (
                  <div className="flex items-center gap-2 text-cult-light">
                    <Calendar className="h-4 w-4 text-cult-gold" />
                    <span>Termina: {formatDateTime(tournament.end_date)}</span>
                  </div>
                )}
                {tournament.registration_deadline && (
                  <div className="flex items-center gap-2 text-cult-light">
                    <Clock className="h-4 w-4 text-cult-gold" />
                    <span>Inscripciones hasta: {formatDateTime(tournament.registration_deadline)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-cult-light">
                  <Users className="h-4 w-4 text-cult-gold" />
                  <span>
                    {tournament.current_registrations} inscritos
                    {tournament.max_teams && ` / ${tournament.max_teams} máximo`}
                  </span>
                </div>
                {tournament.entry_fee > 0 && (
                  <div className="flex items-center gap-2 text-cult-gold">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold font-jetbrains text-lg">
                      Inscripción: {formatCurrency(tournament.entry_fee)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registrations List */}
          {confirmedRegistrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald uppercase tracking-wider">
                  Los Elegidos ({confirmedRegistrations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {confirmedRegistrations.map((reg: { id: string; team_name: string | null; seed: number | null }, index: number) => (
                    <div key={reg.id} className="flex items-center gap-3 p-3 rounded-lg bg-cult-dark/50">
                      <div className="h-8 w-8 rounded-full bg-cult-gold flex items-center justify-center text-cult-black text-sm font-bold font-jetbrains">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-cult-cream font-oswald uppercase tracking-wide">
                          {reg.team_name || `Equipo ${reg.id.slice(0, 8)}`}
                        </p>
                        {reg.seed && (
                          <p className="text-sm text-cult-light">Seed #{reg.seed}</p>
                        )}
                      </div>
                      <Badge variant="success" className="text-xs font-oswald uppercase">
                        Confirmado
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prize Pool */}
          {tournament.prize_pool && typeof tournament.prize_pool === 'object' && Object.keys(tournament.prize_pool).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-oswald uppercase tracking-wider">
                  <Trophy className="h-4 w-4 text-cult-gold" />
                  Premios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(tournament.prize_pool).map(([position, amount]) => (
                    <div key={position} className="flex justify-between">
                      <span className="text-cult-light capitalize font-oswald uppercase">{position} lugar:</span>
                      <span className="font-bold text-cult-gold font-jetbrains">
                        {formatCurrency(amount as number)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-oswald uppercase tracking-wider">Inscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tournament.entry_fee > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-cult-dark/50">
                  <span className="text-sm text-cult-light">Cuota de inscripción</span>
                  <span className="text-lg font-bold text-cult-gold font-jetbrains">
                    {formatCurrency(tournament.entry_fee)}
                  </span>
                </div>
              )}

              {spotsLeft !== null && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-cult-dark/50">
                  <span className="text-sm text-cult-light">Lugares disponibles</span>
                  <span className={`text-lg font-bold font-jetbrains ${spotsLeft <= 4 ? 'text-error' : 'text-cult-gold'}`}>
                    {spotsLeft > 0 ? spotsLeft : 'Lleno'}
                  </span>
                </div>
              )}

              <RegistrationButton
                tournamentId={tournament.id}
                tournamentSlug={tournament.slug}
                entryFee={tournament.entry_fee}
                isOpen={tournament.status === 'registration'}
                isFull={spotsLeft !== null && spotsLeft <= 0}
                isLoggedIn={!!user}
              />
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="font-oswald uppercase tracking-wider">Reglas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-cult-light space-y-2">
                <p>• Puntos por partido: <span className="font-jetbrains text-cult-cream">{tournament.scoring_system?.points_per_match || 32}</span></p>
                <p>• Duración por ronda: <span className="font-jetbrains text-cult-cream">{tournament.round_duration_minutes || 25} min</span></p>
                {tournament.max_teams && (
                  <p>• Máximo de equipos: <span className="font-jetbrains text-cult-cream">{tournament.max_teams}</span></p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
