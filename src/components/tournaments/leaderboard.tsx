import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PlayerStanding } from '@/lib/tournaments/standings';

interface LeaderboardProps {
  standings: PlayerStanding[];
  playerNames?: Map<string, string>; // playerId -> name
}

export function Leaderboard({ standings, playerNames }: LeaderboardProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Jugador</TableHead>
          <TableHead className="text-center">PJ</TableHead>
          <TableHead className="text-center">PG</TableHead>
          <TableHead className="text-center">PP</TableHead>
          <TableHead className="text-center">PF</TableHead>
          <TableHead className="text-center">PC</TableHead>
          <TableHead className="text-center">Dif</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((s) => (
          <TableRow key={s.playerId}>
            <TableCell>
              {s.rankingPosition <= 3 ? (
                <Badge variant={s.rankingPosition === 1 ? 'success' : s.rankingPosition === 2 ? 'info' : 'warning'}>
                  {s.rankingPosition}
                </Badge>
              ) : (
                <span className="text-zinc-500">{s.rankingPosition}</span>
              )}
            </TableCell>
            <TableCell className="font-medium">
              {playerNames?.get(s.playerId) || s.playerId.slice(0, 8)}
            </TableCell>
            <TableCell className="text-center text-zinc-400">{s.matchesPlayed}</TableCell>
            <TableCell className="text-center text-emerald-400">{s.matchesWon}</TableCell>
            <TableCell className="text-center text-red-400">{s.matchesLost}</TableCell>
            <TableCell className="text-center">{s.pointsFor}</TableCell>
            <TableCell className="text-center text-zinc-400">{s.pointsAgainst}</TableCell>
            <TableCell className="text-center">
              <span className={s.pointDiff > 0 ? 'text-emerald-400' : s.pointDiff < 0 ? 'text-red-400' : 'text-zinc-400'}>
                {s.pointDiff > 0 ? '+' : ''}{s.pointDiff}
              </span>
            </TableCell>
            <TableCell className="text-right font-bold text-lg">{s.totalPoints}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
