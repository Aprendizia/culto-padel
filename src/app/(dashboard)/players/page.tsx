import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { User, Star, Trophy, Target } from 'lucide-react';

export default function PlayersPage() {
  // Mock data - in real app, fetch from API
  const players = [
    {
      id: '1',
      displayName: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      level: 'advanced',
      rankingPoints: 1250,
      tournamentsPlayed: 8,
      winRate: 75,
    },
    {
      id: '2',
      displayName: 'Ana López',
      email: 'ana@email.com',
      level: 'intermediate',
      rankingPoints: 890,
      tournamentsPlayed: 5,
      winRate: 60,
    },
    {
      id: '3',
      displayName: 'Miguel Santos',
      email: 'miguel@email.com',
      level: 'beginner',
      rankingPoints: 320,
      tournamentsPlayed: 3,
      winRate: 45,
    },
    {
      id: '4',
      displayName: 'Laura García',
      email: 'laura@email.com',
      level: 'pro',
      rankingPoints: 1890,
      tournamentsPlayed: 12,
      winRate: 85,
    },
  ];

  const levelLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    pro: 'Profesional',
  };

  const levelColors = {
    beginner: 'default' as const,
    intermediate: 'info' as const,
    advanced: 'warning' as const,
    pro: 'success' as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Jugadores</h1>
          <p className="text-zinc-400 mt-1">Directorio de jugadores del club</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <User className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-zinc-400">Total Jugadores</p>
              <p className="text-xl font-bold text-zinc-100">{players.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Star className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-sm text-zinc-400">Promedio Nivel</p>
              <p className="text-xl font-bold text-zinc-100">Intermedio</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-sm text-zinc-400">Torneos Jugados</p>
              <p className="text-xl font-bold text-zinc-100">28</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Target className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-zinc-400">Win Rate Promedio</p>
              <p className="text-xl font-bold text-zinc-100">66%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar jugadores..."
        className="max-w-sm"
      />

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jugador</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead className="text-center">Puntos</TableHead>
                <TableHead className="text-center">Torneos</TableHead>
                <TableHead className="text-center">Win Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                        {player.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{player.displayName}</p>
                        <p className="text-xs text-zinc-400">{player.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={levelColors[player.level as keyof typeof levelColors]}>
                      {levelLabels[player.level as keyof typeof levelLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {player.rankingPoints.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">{player.tournamentsPlayed}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        player.winRate >= 70
                          ? 'text-emerald-400'
                          : player.winRate >= 50
                            ? 'text-amber-400'
                            : 'text-red-400'
                      }
                    >
                      {player.winRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}