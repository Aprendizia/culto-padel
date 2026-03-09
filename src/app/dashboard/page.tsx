import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, DollarSign, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get tenant_id from profiles or tenant_memberships
  let tenantId: string | null = null;

  if (user) {
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (membership) {
      tenantId = (membership as any).tenant_id;
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tenantId = (profile as any)?.tenant_id || null;
    }
  }

  // Fetch stats
  let activeTournaments = 0;
  let totalPlayers = 0;
  let totalRevenue = 0;
  let recentRegistrations: Array<{ id: string; team_name: string | null; status: string; registered_at: string; tournaments: { name: string } | null }> = [];

  if (tenantId) {
    // Active tournaments
    const { count: tournamentCount } = await supabase
      .from('tournaments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['registration', 'active']);
    activeTournaments = tournamentCount || 0;

    // Total registrations (as proxy for players)
    const { count: playerCount } = await supabase
      .from('tournament_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['confirmed', 'paid']);
    totalPlayers = playerCount || 0;

    // Recent registrations
    const { data: recentRegs } = await supabase
      .from('tournament_registrations')
      .select('id, team_name, status, registered_at, tournaments(name)')
      .eq('tenant_id', tenantId)
      .order('registered_at', { ascending: false })
      .limit(5);
    recentRegistrations = (recentRegs as typeof recentRegistrations) || [];

    // Try to get revenue from metrics view, fallback to 0
    try {
      const { data: metrics } = await supabase
        .from('v_tenant_metrics')
        .select('total_revenue')
        .eq('tenant_id', tenantId)
        .single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalRevenue = (metrics as any)?.total_revenue || 0;
    } catch {
      // View may not exist yet
      totalRevenue = 0;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-oswald font-bold text-cult-cream uppercase tracking-wide">Dashboard</h1>
        <p className="text-cult-light mt-1">Resumen de tu club</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cult-light">Torneos Activos</CardTitle>
            <Trophy className="h-4 w-4 text-cult-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cult-cream font-jetbrains">{activeTournaments}</div>
            <p className="text-xs text-cult-light">En inscripción o en curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cult-light">Jugadores Inscritos</CardTitle>
            <Users className="h-4 w-4 text-cult-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cult-cream font-jetbrains">{totalPlayers}</div>
            <p className="text-xs text-cult-light">Inscripciones confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cult-light">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-cult-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cult-gold font-jetbrains">
              {totalRevenue > 0 ? formatCurrency(totalRevenue) : '$0'}
            </div>
            <p className="text-xs text-cult-light">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cult-light">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-cult-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cult-cream font-jetbrains">{activeTournaments}</div>
            <p className="text-xs text-cult-light">Programados</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="font-oswald uppercase tracking-wider text-cult-cream">Inscripciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRegistrations.length === 0 ? (
            <p className="text-cult-light text-center py-8">No hay inscripciones aún</p>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-cult-dark/50">
                  <div>
                    <p className="text-sm font-medium text-cult-cream">
                      {reg.team_name || `Equipo ${reg.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-cult-light">
                      {reg.tournaments?.name || 'Torneo'} • {new Date(reg.registered_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <span className={`text-xs font-oswald uppercase tracking-wider px-2 py-1 rounded ${
                    reg.status === 'paid' || reg.status === 'confirmed'
                      ? 'bg-cult-gold/20 text-cult-gold'
                      : 'bg-cult-medium text-cult-light'
                  }`}>
                    {reg.status === 'paid' || reg.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
