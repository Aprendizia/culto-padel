import Link from 'next/link';
import { Trophy, ArrowRight, Play, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function HomePage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');

  const supabase = await createClient();

  type TenantInfo = { id: string; name: string; logo_url: string | null; description: string | null };
  type TournamentInfo = {
    id: string;
    name: string;
    slug: string;
    format: string;
    start_date: string | null;
    entry_fee: number;
    max_teams: number | null;
    current_registrations: number;
    is_featured: boolean;
    status: string;
    tournament_categories: { name: string; gender: string } | null;
  };

  let tenant: TenantInfo | null = null;
  let tournaments: TournamentInfo[] = [];

  if (tenantSlug) {
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('id, name, logo_url, description')
      .eq('slug', tenantSlug)
      .single();

    tenant = tenantData as TenantInfo | null;

    if (tenant) {
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('id, name, slug, format, start_date, entry_fee, max_teams, current_registrations, is_featured, status, tournament_categories(name, gender)')
        .eq('tenant_id', tenant.id)
        .in('status', ['registration', 'active'])
        .eq('is_public', true)
        .order('start_date', { ascending: true })
        .limit(6);

      tournaments = (tournamentsData as TournamentInfo[]) || [];
    }
  }

  const displayName = tenant?.name || 'CULTO PÁDEL';

  const formatLabels: Record<string, string> = {
    americano: 'AMERICANO',
    mexicano: 'MEXICANO',
    mixed_americano: 'MIXTO',
    knockout: 'ELIMINACIÓN',
    round_robin: 'ROUND ROBIN',
    double_elimination: 'DOBLE ELIM.',
    swiss: 'SUIZO',
    league: 'LIGA',
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cult-black via-cult-black to-cult-gold/10 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-cult-gold/20 px-4 py-2 ring-1 ring-cult-gold/30 mb-8">
            <Trophy className="h-4 w-4 text-cult-gold" />
            <span className="text-sm text-cult-gold font-oswald uppercase tracking-wider">La orden ha comenzado</span>
          </div>
          
          <h1 className="text-5xl font-oswald font-bold tracking-tight text-cult-gold sm:text-7xl uppercase">
            {tenant ? displayName : 'EL CULTO'}
            <span className="block text-cult-cream">{tenant ? 'TORNEOS' : 'CONVOCA'}</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-cult-light">
            {tenant
              ? `Torneos de pádel organizados por ${displayName}. Inscríbete, compite y demuestra tu nivel.`
              : 'Torneos de pádel que se sienten como una orden secreta. Solo los elegidos comprenden la devoción al juego perfecto.'
            }
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase">
                <Play className="h-4 w-4 mr-2" />
                Responde al Llamado
              </Button>
            </Link>
            <Link href="/t">
              <Button variant="outline" size="lg" className="font-oswald font-bold tracking-wide uppercase">
                Ver Torneos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.cult.gold/10),transparent)]" />
          <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-cult-black shadow-xl shadow-cult-gold/5 ring-1 ring-cult-medium sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
        </div>
      </section>

      {/* Featured Tournaments Section */}
      <section className="py-24 bg-cult-dark/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-oswald font-bold text-cult-gold sm:text-5xl uppercase tracking-wide">
              Los Elegidos del Mes
            </h2>
            <p className="mt-4 text-lg text-cult-light">
              {tenant
                ? `Próximos torneos de ${displayName}`
                : 'Torneos CPAM — El circuito amateur más competitivo de México'
              }
            </p>
          </div>
          
          {tournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => {
                const spotsLeft = tournament.max_teams
                  ? tournament.max_teams - tournament.current_registrations
                  : null;

                return (
                  <Link key={tournament.id} href={`/t/${tournament.slug}`} className="block group">
                    <Card className="group hover:border-cult-gold transition-all hover:shadow-lg hover:shadow-cult-gold/10">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <Badge variant="default" className="uppercase tracking-wider font-oswald">
                            {formatLabels[tournament.format] || tournament.format.toUpperCase()}
                          </Badge>
                          {spotsLeft !== null && spotsLeft <= 4 && (
                            <Badge variant="error" className="text-xs font-oswald">
                              {spotsLeft} lugares
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-oswald font-bold text-cult-cream mb-3 uppercase tracking-wide group-hover:text-cult-gold transition-colors">
                          {tournament.name}
                        </h3>

                        <div className="space-y-2 mb-4">
                          {tournament.start_date && (
                            <div className="flex items-center gap-2 text-sm text-cult-light">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(tournament.start_date)}</span>
                            </div>
                          )}
                          {tournament.tournament_categories && (
                            <div className="flex items-center gap-2 text-sm text-cult-light">
                              <Trophy className="h-3.5 w-3.5" />
                              <span>{tournament.tournament_categories.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar */}
                        {tournament.max_teams && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-cult-light mb-1">
                              <span>Inscritos</span>
                              <span className="font-jetbrains">{tournament.current_registrations}/{tournament.max_teams}</span>
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
                          {tournament.entry_fee > 0 ? (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-cult-gold" />
                              <span className="text-cult-gold font-bold font-jetbrains text-lg">
                                {formatCurrency(tournament.entry_fee)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-cult-light font-oswald uppercase">Gratis</span>
                          )}
                          <span className="text-cult-gold hover:text-cult-black hover:bg-cult-gold font-oswald uppercase tracking-wide text-sm px-3 py-1 rounded-lg transition-colors">
                            Inscribirse →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cult-dark mb-6">
                <Trophy className="h-10 w-10 text-cult-gold" />
              </div>
              <h3 className="text-2xl font-oswald font-bold text-cult-cream uppercase tracking-wide mb-3">
                Próximamente
              </h3>
              <p className="text-cult-light text-lg max-w-md mx-auto">
                Los torneos están en preparación. Regístrate para recibir notificaciones cuando se abran las inscripciones.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button variant="primary" className="bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase">
                    Crear Cuenta
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {tournaments.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/t">
                <Button variant="outline" size="lg" className="font-oswald font-bold tracking-wide uppercase">
                  Ver Todos los Torneos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-cult-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-oswald font-bold text-cult-gold sm:text-5xl uppercase tracking-wide">
              El Ritual
            </h2>
            <p className="mt-4 text-lg text-cult-light">
              Tres pasos para unirte a la orden
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group hover:border-cult-gold transition-all">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-gold text-cult-black mb-6 text-2xl font-oswald font-bold font-jetbrains">
                  1
                </div>
                <h3 className="text-xl font-oswald font-bold text-cult-cream mb-4 uppercase tracking-wide">
                  Descubre
                </h3>
                <p className="text-cult-light">
                  Explora los torneos disponibles y encuentra el que despierte tu devoción por el pádel.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:border-cult-gold transition-all">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-gold text-cult-black mb-6 text-2xl font-oswald font-bold font-jetbrains">
                  2
                </div>
                <h3 className="text-xl font-oswald font-bold text-cult-cream mb-4 uppercase tracking-wide">
                  Inscríbete
                </h3>
                <p className="text-cult-light">
                  Completa tu iniciación con el pago seguro. Solo los comprometidos avanzan.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:border-cult-gold transition-all">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-gold text-cult-black mb-6 text-2xl font-oswald font-bold font-jetbrains">
                  3
                </div>
                <h3 className="text-xl font-oswald font-bold text-cult-cream mb-4 uppercase tracking-wide">
                  Compite
                </h3>
                <p className="text-cult-light">
                  Demuestra tu devoción en la cancha. Solo los verdaderos creyentes trascienden.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-cult-gold via-cult-gold-light to-cult-gold py-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-4xl font-oswald font-bold text-cult-black uppercase tracking-wide">
            ¿Listo para el Culto?
          </h2>
          <p className="mt-4 text-lg text-cult-black/80">
            La orden te llama. No todos son elegidos, pero tú puedes serlo.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button variant="default" size="lg" className="bg-cult-black text-cult-gold hover:bg-cult-dark font-oswald font-bold tracking-wide uppercase text-lg px-8 py-4">
                <Trophy className="h-5 w-5 mr-2" />
                Unirse al Culto
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
