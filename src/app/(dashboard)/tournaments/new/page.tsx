'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import Link from 'next/link';

const formatOptions = [
  { value: 'americano', label: 'Americano' },
  { value: 'mexicano', label: 'Mexicano' },
  { value: 'mixed_americano', label: 'Americano Mixto' },
  { value: 'knockout', label: 'Eliminación Directa' },
  { value: 'double_elimination', label: 'Doble Eliminación' },
  { value: 'round_robin', label: 'Round Robin' },
];

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    format: '',
    entryFee: 0,
    maxTeams: '',
    startDate: '',
    registrationDeadline: '',
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          format: form.format,
          entryFee: form.entryFee,
          maxTeams: form.maxTeams ? parseInt(form.maxTeams) : undefined,
          startDate: form.startDate || undefined,
          registrationDeadline: form.registrationDeadline || undefined,
          isPublic: form.isPublic,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const { tournament } = await res.json();
      toast({ title: 'Torneo creado', variant: 'success' });
      router.push(`/dashboard/tournaments/${tournament.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error', description: message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Nuevo Torneo</h1>
          <p className="text-zinc-400 mt-1">Crea un nuevo torneo para tu club</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Torneo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del torneo *"
                placeholder="Americano Nocturno"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Select
                label="Formato *"
                options={formatOptions}
                placeholder="Selecciona formato"
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                required
              />
            </div>

            <Input
              label="Descripción"
              placeholder="Describe tu torneo..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Cuota de inscripción (MXN)"
                type="number"
                min={0}
                placeholder="0"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Máximo de equipos"
                type="number"
                min={2}
                placeholder="Sin límite"
                value={form.maxTeams}
                onChange={(e) => setForm({ ...form, maxTeams: e.target.value })}
              />
              <Input
                label="Fecha de inicio"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>

            <Input
              label="Fecha límite de inscripción"
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="rounded border-zinc-700"
              />
              <label htmlFor="isPublic" className="text-sm text-zinc-300">
                Torneo público (visible para jugadores)
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>
                Crear Torneo
              </Button>
              <Link href="/dashboard/tournaments">
                <Button variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}