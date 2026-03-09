'use client';

import { use } from 'react';
import { ArrowLeft, Play, Users, Trophy, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTournament } from '@/hooks/use-tournament';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import Link from 'next/link';

type Props = { params: Promise<{ tournamentId: string }> };

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  draft: { label: 'Borrador', variant: 'default' },
  registration: { label: 'Inscripciones', variant: 'success' },
  active: { label: 'En curso', variant: 'info' },
  paused: { label: 'Pausado', variant: 'warning' },
  completed: { label: 'Finalizado', variant: 'default' },
  canceled: { label: 'Cancelado', variant: 'error' },
};

export default function TournamentDetailPage({ params }: Props) {
  const { tournamentId } = use(params);
  const { tournament, registrations, loading } = useTournament(tournamentId);

  const generateBracket = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/bracket`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast({ title: 'Bracket generado', variant: 'success' });
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error', description: message, variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-cult-dark rounded animate-pulse" />
        <div className="h-64 bg-cult-dark rounded-xl animate-pulse border border-cult-medium" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-oswald font-bold text-cult-cream uppercase">Torneo no encontrado</h1>
        <Link href="/dashboard/tournaments" className="mt-4 inline-block">
          <Button variant="outline" className="font-oswald uppercase tracking-wide">Volver a Torneos</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[tournament.status] || statusConfig.draft;

  // Count by status
  const confirmed = registrations.filter(r => ['confirmed', 'paid'].includes(r.status)).length;
  const pending = registrations.filter(r => r.status === 'pending').length;
  const waitlisted = registrations.filter(r => r.status === 'waitlisted').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments">
          <Button variant="ghost" size="sm" className="text-cult-light hover:text-cult-gold font-oswald uppercase tracking-wide">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torneos
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-oswald font-bold text-cult-cream uppercase tracking-wide">{tournament.name}</h1>
          {tournament.description && (
            <p className="text-cult-light mt-1">{tournament.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="font-oswald uppercase tracking-wider">
            {status.label}
          </Badge>
          {tournament.status === 'draft' && registrations.length >= 2 && (
            <Button
              variant="primary"
              onClick={generateBracket}
              className="bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase"
            >
              <Play className="h-4 w-4 mr-2" />
              Generar Bracket
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-8 w-8 text-cult-gold" />
            <div>
              <p className="text-sm text-cult-light">Formato</p>
              <p className="font-medium text-cult-cream capitalize font-oswald uppercase">{tournament.format}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-cult-gold" />
            <div>
              <p className="text-sm text-cult-light">Participantes</p>
              <p className="font-medium text-cult-cream font-jetbrains">
                {tournament.current_registrations}
                {tournament.max_teams && ` / ${tournament.max_teams}`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-8 w-8 text-cult-gold" />
            <div>
              <p className="text-sm text-cult-light">Inicio</p>
              <p className="font-medium text-cult-cream">
                {tournament.start_date ? formatDate(tournament.start_date) : 'Por definir'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <DollarSign className="h-8 w-8 text-cult-gold" />
            <div>
              <p className="text-sm text-cult-light">Inscripción</p>
              <p className="font-medium text-cult-gold font-jetbrains">
                {tournament.entry_fee > 0 ? formatCurrency(tournament.entry_fee) : 'Gratis'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cult-gold font-jetbrains">{confirmed}</p>
            <p className="text-xs text-cult-light font-oswald uppercase tracking-wider">Confirmados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cult-cream font-jetbrains">{pending}</p>
            <p className="text-xs text-cult-light font-oswald uppercase tracking-wider">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cult-cream font-jetbrains">{waitlisted}</p>
            <p className="text-xs text-cult-light font-oswald uppercase tracking-wider">Lista de espera</p>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-oswald uppercase tracking-wider text-cult-cream">
            Inscripciones ({registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-cult-light text-center py-8">No hay inscripciones aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cult-medium">
                    <th className="text-left py-3 px-4 text-xs font-oswald uppercase tracking-wider text-cult-light">#</th>
                    <th className="text-left py-3 px-4 text-xs font-oswald uppercase tracking-wider text-cult-light">Equipo</th>
                    <th className="text-left py-3 px-4 text-xs font-oswald uppercase tracking-wider text-cult-light">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-oswald uppercase tracking-wider text-cult-light">Pago</th>
                    <th className="text-left py-3 px-4 text-xs font-oswald uppercase tracking-wider text-cult-light">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, index) => (
                    <tr key={reg.id} className="border-b border-cult-medium/50 hover:bg-cult-dark/50">
                      <td className="py-3 px-4 text-sm text-cult-light font-jetbrains">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-cult-cream font-medium">
                        {reg.team_name || `Equipo ${reg.id.slice(0, 8)}`}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            ['confirmed', 'paid'].includes(reg.status) ? 'success'
                            : reg.status === 'pending' ? 'warning'
                            : 'default'
                          }
                          className="text-xs font-oswald uppercase"
                        >
                          {reg.status === 'confirmed' || reg.status === 'paid' ? 'Confirmado'
                            : reg.status === 'pending' ? 'Pendiente'
                            : reg.status === 'waitlisted' ? 'Espera'
                            : reg.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            reg.payment_status === 'succeeded' ? 'success'
                            : reg.payment_status === 'pending' ? 'warning'
                            : 'default'
                          }
                          className="text-xs font-oswald uppercase"
                        >
                          {reg.payment_status === 'succeeded' ? 'Pagado'
                            : reg.payment_status === 'pending' ? 'Pendiente'
                            : reg.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-cult-light font-jetbrains">
                        {new Date(reg.registered_at).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
