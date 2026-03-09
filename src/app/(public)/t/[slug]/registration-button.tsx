'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

interface RegistrationButtonProps {
  tournamentId: string;
  tournamentSlug: string;
  entryFee: number;
  isOpen: boolean;
  isFull: boolean;
  isLoggedIn: boolean;
}

export function RegistrationButton({
  tournamentId,
  tournamentSlug,
  entryFee,
  isOpen,
  isFull,
  isLoggedIn,
}: RegistrationButtonProps) {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=/t/${tournamentSlug}`;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create registration
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
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
      if (entryFee > 0) {
        const checkoutRes = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tournamentId,
            registrationId: registration.id,
          }),
        });

        if (!checkoutRes.ok) throw new Error('Error al crear sesión de pago');

        const { url } = await checkoutRes.json();
        window.location.href = url;
        return;
      }

      // Free tournament — reload the page
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="Nombre del equipo (opcional)"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        disabled={!isOpen || isFull}
        className="bg-cult-dark border-cult-medium text-cult-cream placeholder:text-cult-light/50"
      />

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase"
        onClick={handleRegister}
        disabled={!isOpen || isFull || loading}
      >
        {loading
          ? 'Procesando...'
          : isFull
            ? 'Torneo lleno'
            : !isOpen
              ? 'Inscripciones cerradas'
              : !isLoggedIn
                ? 'Iniciar sesión para inscribirse'
                : entryFee > 0
                  ? `Inscribirse — ${formatCurrency(entryFee)}`
                  : 'Inscribirse gratis'}
      </Button>
    </div>
  );
}
