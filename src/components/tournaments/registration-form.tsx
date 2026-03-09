'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/utils';
import type { Tournament } from '@/types/database';

interface RegistrationFormProps {
  tournament: Tournament;
  isLoggedIn: boolean;
}

export function RegistrationForm({ tournament, isLoggedIn }: RegistrationFormProps) {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const isFull = tournament.max_teams ? tournament.current_registrations >= tournament.max_teams : false;
  const isOpen = tournament.status === 'registration';

  const handleRegister = async () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=/t/${tournament.slug}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const { registration } = await res.json();

      // If there's a fee, redirect to checkout
      if (tournament.entry_fee > 0) {
        const checkoutRes = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tournamentId: tournament.id,
            registrationId: registration.id,
          }),
        });

        if (!checkoutRes.ok) throw new Error('Error al crear sesión de pago');

        const { url } = await checkoutRes.json();
        window.location.href = url;
        return;
      }

      toast({ title: '¡Registrado!', description: 'Tu inscripción ha sido confirmada', variant: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error', description: message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscripción</CardTitle>
        <CardDescription>
          {isOpen
            ? `${tournament.current_registrations}${tournament.max_teams ? ` / ${tournament.max_teams}` : ''} inscritos`
            : 'Las inscripciones no están abiertas'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tournament.entry_fee > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
            <span className="text-sm text-zinc-400">Cuota de inscripción</span>
            <span className="text-lg font-bold text-emerald-400">
              {formatCurrency(tournament.entry_fee)}
            </span>
          </div>
        )}

        <Input
          label="Nombre del equipo (opcional)"
          placeholder="Los Invencibles"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          disabled={!isOpen || isFull}
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={!isOpen || isFull}
          onClick={handleRegister}
        >
          {isFull
            ? 'Torneo lleno'
            : !isOpen
              ? 'Inscripciones cerradas'
              : tournament.entry_fee > 0
                ? `Inscribirse — ${formatCurrency(tournament.entry_fee)}`
                : 'Inscribirse gratis'}
        </Button>
      </CardContent>
    </Card>
  );
}
