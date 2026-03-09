'use client';

import { cn } from '@/lib/utils';
import type { Match } from '@/types/database';

interface BracketViewProps {
  matches: Match[];
  registrations: Map<string, string>; // registration_id -> team_name
}

export function BracketView({ matches, registrations }: BracketViewProps) {
  // Group matches by round
  const rounds = new Map<number, Match[]>();
  for (const match of matches) {
    if (!rounds.has(match.round)) rounds.set(match.round, []);
    rounds.get(match.round)!.push(match);
  }

  const sortedRounds = [...rounds.entries()].sort(([a], [b]) => a - b);
  const totalRounds = sortedRounds.length;

  const roundLabels = (round: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semifinal';
    if (round === totalRounds - 2) return 'Cuartos';
    return `Ronda ${round}`;
  };

  const getTeamName = (regId: string | null) => {
    if (!regId) return 'TBD';
    return registrations.get(regId) || 'Equipo';
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {sortedRounds.map(([round, roundMatches]) => (
          <div key={round} className="flex flex-col">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 text-center">
              {roundLabels(round)}
            </h4>
            <div
              className="flex flex-col justify-around flex-1 gap-4"
              style={{ minHeight: `${roundMatches.length * 100}px` }}
            >
              {roundMatches
                .sort((a, b) => a.match_number - b.match_number)
                .map((match) => (
                  <div
                    key={match.id}
                    className={cn(
                      'rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden min-w-[200px]',
                      match.status === 'completed' && 'border-zinc-700'
                    )}
                  >
                    {/* Team A */}
                    <div
                      className={cn(
                        'flex items-center justify-between px-3 py-2 border-b border-zinc-800',
                        match.winner_side === 'a' && 'bg-emerald-500/10'
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm truncate',
                          match.winner_side === 'a' ? 'text-emerald-400 font-medium' : 'text-zinc-300'
                        )}
                      >
                        {getTeamName(match.team_a_registration_id)}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-mono ml-2',
                          match.winner_side === 'a' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                        )}
                      >
                        {match.status === 'completed' ? match.score_team_a : '-'}
                      </span>
                    </div>
                    {/* Team B */}
                    <div
                      className={cn(
                        'flex items-center justify-between px-3 py-2',
                        match.winner_side === 'b' && 'bg-emerald-500/10'
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm truncate',
                          match.winner_side === 'b' ? 'text-emerald-400 font-medium' : 'text-zinc-300'
                        )}
                      >
                        {getTeamName(match.team_b_registration_id)}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-mono ml-2',
                          match.winner_side === 'b' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                        )}
                      >
                        {match.status === 'completed' ? match.score_team_b : '-'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
