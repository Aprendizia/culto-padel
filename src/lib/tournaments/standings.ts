export interface MatchResult {
  id: string;
  tournamentId: string;
  teamAPlayerIds: string[];
  teamBPlayerIds: string[];
  teamARegistrationId?: string;
  teamBRegistrationId?: string;
  scoreTeamA: number;
  scoreTeamB: number;
  winnerSide: 'a' | 'b' | 'draw' | null;
  status: string;
}

export interface PlayerStanding {
  playerId: string;
  registrationId?: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  totalPoints: number;
  bonusPoints: number;
  rankingPosition: number;
}

/**
 * Calculate leaderboard standings from match results.
 *
 * Supports both:
 * - Team-based scoring (via registrationId) for knockout/round-robin
 * - Individual scoring (via playerIds) for Americano format
 *
 * Sort order:
 * 1. total_points DESC
 * 2. point_diff DESC
 * 3. matches_won DESC
 * 4. points_for DESC
 */
export function calculateStandings(
  matches: MatchResult[],
  mode: 'individual' | 'team' = 'individual',
  bonusRules?: { winBonus?: number; drawBonus?: number }
): PlayerStanding[] {
  const statsMap = new Map<string, Omit<PlayerStanding, 'rankingPosition'>>();

  const getOrCreate = (id: string, registrationId?: string) => {
    if (!statsMap.has(id)) {
      statsMap.set(id, {
        playerId: id,
        registrationId,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        totalPoints: 0,
        bonusPoints: 0,
      });
    }
    return statsMap.get(id)!;
  };

  const completedMatches = matches.filter((m) => m.status === 'completed');

  for (const match of completedMatches) {
    if (mode === 'individual') {
      // Americano: each player gets individual points
      for (const playerId of match.teamAPlayerIds) {
        const stats = getOrCreate(playerId);
        stats.matchesPlayed++;
        stats.pointsFor += match.scoreTeamA;
        stats.pointsAgainst += match.scoreTeamB;

        if (match.winnerSide === 'a') {
          stats.matchesWon++;
          stats.bonusPoints += bonusRules?.winBonus ?? 0;
        } else if (match.winnerSide === 'b') {
          stats.matchesLost++;
        } else {
          stats.matchesDrawn++;
          stats.bonusPoints += bonusRules?.drawBonus ?? 0;
        }
      }

      for (const playerId of match.teamBPlayerIds) {
        const stats = getOrCreate(playerId);
        stats.matchesPlayed++;
        stats.pointsFor += match.scoreTeamB;
        stats.pointsAgainst += match.scoreTeamA;

        if (match.winnerSide === 'b') {
          stats.matchesWon++;
          stats.bonusPoints += bonusRules?.winBonus ?? 0;
        } else if (match.winnerSide === 'a') {
          stats.matchesLost++;
        } else {
          stats.matchesDrawn++;
          stats.bonusPoints += bonusRules?.drawBonus ?? 0;
        }
      }
    } else {
      // Team-based: use registration IDs
      if (match.teamARegistrationId) {
        const stats = getOrCreate(match.teamARegistrationId);
        stats.matchesPlayed++;
        stats.pointsFor += match.scoreTeamA;
        stats.pointsAgainst += match.scoreTeamB;

        if (match.winnerSide === 'a') {
          stats.matchesWon++;
          stats.bonusPoints += bonusRules?.winBonus ?? 0;
        } else if (match.winnerSide === 'b') {
          stats.matchesLost++;
        } else {
          stats.matchesDrawn++;
          stats.bonusPoints += bonusRules?.drawBonus ?? 0;
        }
      }

      if (match.teamBRegistrationId) {
        const stats = getOrCreate(match.teamBRegistrationId);
        stats.matchesPlayed++;
        stats.pointsFor += match.scoreTeamB;
        stats.pointsAgainst += match.scoreTeamA;

        if (match.winnerSide === 'b') {
          stats.matchesWon++;
          stats.bonusPoints += bonusRules?.winBonus ?? 0;
        } else if (match.winnerSide === 'a') {
          stats.matchesLost++;
        } else {
          stats.matchesDrawn++;
          stats.bonusPoints += bonusRules?.drawBonus ?? 0;
        }
      }
    }
  }

  // Calculate derived fields and sort
  const standings = [...statsMap.values()].map((s) => ({
    ...s,
    pointDiff: s.pointsFor - s.pointsAgainst,
    totalPoints: s.pointsFor + s.bonusPoints,
    rankingPosition: 0,
  }));

  // Sort: total_points DESC, point_diff DESC, matches_won DESC, points_for DESC
  standings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
    return b.pointsFor - a.pointsFor;
  });

  // Assign ranking positions
  standings.forEach((s, i) => {
    s.rankingPosition = i + 1;
  });

  return standings;
}

/**
 * Convert standings to DB-ready rows
 */
export function standingsToDbRows(
  standings: PlayerStanding[],
  tournamentId: string,
  tenantId: string,
  mode: 'individual' | 'team' = 'individual'
) {
  return standings.map((s) => ({
    tournament_id: tournamentId,
    tenant_id: tenantId,
    player_id: mode === 'individual' ? s.playerId : null,
    registration_id: mode === 'team' ? s.playerId : s.registrationId || null,
    matches_played: s.matchesPlayed,
    matches_won: s.matchesWon,
    matches_lost: s.matchesLost,
    matches_drawn: s.matchesDrawn,
    points_for: s.pointsFor,
    points_against: s.pointsAgainst,
    bonus_points: s.bonusPoints,
    ranking_position: s.rankingPosition,
    updated_at: new Date().toISOString(),
  }));
}
