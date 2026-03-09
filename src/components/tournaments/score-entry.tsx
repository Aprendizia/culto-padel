'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import type { Match } from '@/types/database';

interface ScoreEntryProps {
  match: Match;
  tournamentId: string;
  teamAName: string;
  teamBName: string;
  pointsPerMatch?: number; // For Americano, scores must sum to this
  onScoreSubmitted?: (match: Match) => void;
}

export function ScoreEntry({
  match,
  tournamentId,
  teamAName,
  teamBName,
  pointsPerMatch,
  onScoreSubmitted,
}: ScoreEntryProps) {
  const [scoreA, setScoreA] = useState(match.score_team_a || 0);
  const [scoreB, setScoreB] = useState(match.score_team_b || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (pointsPerMatch && scoreA + scoreB !== pointsPerMatch) {
      toast({
        title: 'Error',
        description: `Los puntajes deben sumar ${pointsPerMatch}`,
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          scoreTeamA: scoreA,
          scoreTeamB: scoreB,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const { match: updatedMatch } = await res.json();
      toast({ title: 'Marcador registrado', variant: 'success' });
      onScoreSubmitted?.(updatedMatch);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error', description: message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = match.status === 'completed';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
      <div className="flex-1 text-right">
        <span className="text-sm text-zinc-300 font-medium">{teamAName}</span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          value={scoreA}
          onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
          className="w-16 text-center"
          disabled={isCompleted}
        />
        <span className="text-zinc-600 font-bold">vs</span>
        <Input
          type="number"
          min={0}
          value={scoreB}
          onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
          className="w-16 text-center"
          disabled={isCompleted}
        />
      </div>
      <div className="flex-1">
        <span className="text-sm text-zinc-300 font-medium">{teamBName}</span>
      </div>
      {!isCompleted && (
        <Button size="sm" variant="primary" loading={loading} onClick={handleSubmit}>
          Guardar
        </Button>
      )}
    </div>
  );
}
