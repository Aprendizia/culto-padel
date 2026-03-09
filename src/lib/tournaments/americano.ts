import { generateId } from '@/lib/utils';

export interface AmericanoPlayer {
  id: string;
  name: string;
}

export interface AmericanoMatchSlot {
  id: string;
  round: number;
  matchNumber: number;
  court: number;
  teamAPlayerIds: [string, string];
  teamBPlayerIds: [string, string];
}

export interface AmericanoRound {
  round: number;
  matches: AmericanoMatchSlot[];
  sitOuts: string[]; // Players sitting out this round (when not divisible by 4)
}

export interface AmericanoSchedule {
  rounds: AmericanoRound[];
  totalRounds: number;
  matchesPerPlayer: number;
  pointsPerMatch: number;
}

/**
 * Generate all unique pairs from a list of player IDs
 */
function getAllPairs(playerIds: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      pairs.push([playerIds[i], playerIds[j]]);
    }
  }
  return pairs;
}

/**
 * Check if two pairs share any players
 */
function pairsOverlap(a: [string, string], b: [string, string]): boolean {
  return a[0] === b[0] || a[0] === b[1] || a[1] === b[0] || a[1] === b[1];
}

/**
 * Generate a round where:
 * - Each active player plays exactly once
 * - No pair that's already been used is repeated
 * - Matches fill available courts
 */
function generateRound(
  activePlayers: string[],
  usedPairs: Set<string>,
  courts: number
): { matches: Array<{ teamA: [string, string]; teamB: [string, string] }>; success: boolean } {
  const maxMatches = Math.min(courts, Math.floor(activePlayers.length / 4));
  const allPairs = getAllPairs(activePlayers);

  // Filter to unused pairs
  const availablePairs = allPairs.filter(
    (p) => !usedPairs.has(pairKey(p))
  );

  const matches: Array<{ teamA: [string, string]; teamB: [string, string] }> = [];
  const usedInRound = new Set<string>();

  // Greedy matching: pick pairs that form valid matches
  for (let i = 0; i < availablePairs.length && matches.length < maxMatches; i++) {
    const teamA = availablePairs[i];

    // Skip if any player already used this round
    if (usedInRound.has(teamA[0]) || usedInRound.has(teamA[1])) continue;

    // Find an opposing pair
    for (let j = i + 1; j < availablePairs.length; j++) {
      const teamB = availablePairs[j];

      // No overlap with teamA and no player already used
      if (
        !pairsOverlap(teamA, teamB) &&
        !usedInRound.has(teamB[0]) &&
        !usedInRound.has(teamB[1])
      ) {
        matches.push({ teamA, teamB });
        usedInRound.add(teamA[0]);
        usedInRound.add(teamA[1]);
        usedInRound.add(teamB[0]);
        usedInRound.add(teamB[1]);
        break;
      }
    }
  }

  return { matches, success: matches.length > 0 };
}

function pairKey(pair: [string, string]): string {
  return [pair[0], pair[1]].sort().join(':');
}

/**
 * Generate a complete Americano tournament schedule.
 *
 * Americano format rules:
 * - Players are randomly paired each round (no pair repeats)
 * - Each player plays once per round
 * - Points are individual (each player on the winning team gets the match points)
 * - All matches play to a fixed number of points (e.g., 32)
 * - Total points in each match = pointsPerMatch (e.g., if score is 20-12, total = 32)
 *
 * @param players - Array of players
 * @param courts - Number of available courts
 * @param pointsPerMatch - Total points per match (both teams' scores sum to this)
 * @param maxRounds - Optional maximum number of rounds
 */
export function generateAmericanoSchedule(
  players: AmericanoPlayer[],
  courts: number,
  pointsPerMatch: number = 32,
  maxRounds?: number
): AmericanoSchedule {
  if (players.length < 4) {
    throw new Error('Americano requires at least 4 players');
  }

  const playerIds = players.map((p) => p.id);
  const totalPairs = getAllPairs(playerIds);
  const usedPairs = new Set<string>();
  const rounds: AmericanoRound[] = [];

  // Track how many times each player has sat out for balanced scheduling
  const sitOutCount: Map<string, number> = new Map();
  playerIds.forEach((id) => sitOutCount.set(id, 0));

  // Calculate how many rounds we can generate (limited by unique pairs)
  const maxPossibleRounds = maxRounds || Math.floor(totalPairs.length / Math.floor(players.length / 4));
  let roundNum = 0;

  while (roundNum < maxPossibleRounds) {
    roundNum++;

    // Determine active players (if not divisible by 4, some sit out)
    let activePlayers = [...playerIds];
    const sitOuts: string[] = [];

    const remainder = activePlayers.length % 4;
    if (remainder > 0) {
      // Sit out the players who have sat out least
      const sorted = [...activePlayers].sort(
        (a, b) => (sitOutCount.get(a) || 0) - (sitOutCount.get(b) || 0)
      );
      // Sit out `remainder` players from the end (most sit-outs already)
      // Actually sit out from the ones who played most
      const toSitOut = sorted.slice(sorted.length - remainder);
      for (const id of toSitOut) {
        sitOuts.push(id);
        sitOutCount.set(id, (sitOutCount.get(id) || 0) + 1);
      }
      activePlayers = activePlayers.filter((id) => !sitOuts.includes(id));
    }

    // Shuffle active players for variety
    for (let i = activePlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [activePlayers[i], activePlayers[j]] = [activePlayers[j], activePlayers[i]];
    }

    const { matches, success } = generateRound(activePlayers, usedPairs, courts);

    if (!success) break; // No more valid rounds possible

    // Mark pairs as used
    for (const match of matches) {
      usedPairs.add(pairKey(match.teamA));
      usedPairs.add(pairKey(match.teamB));
    }

    const roundMatches: AmericanoMatchSlot[] = matches.map((m, i) => ({
      id: generateId(),
      round: roundNum,
      matchNumber: i + 1,
      court: (i % courts) + 1,
      teamAPlayerIds: m.teamA,
      teamBPlayerIds: m.teamB,
    }));

    rounds.push({
      round: roundNum,
      matches: roundMatches,
      sitOuts,
    });
  }

  // Calculate matches per player (approximate, may vary with sit-outs)
  const matchCountPerPlayer: Map<string, number> = new Map();
  playerIds.forEach((id) => matchCountPerPlayer.set(id, 0));
  for (const round of rounds) {
    for (const match of round.matches) {
      for (const id of [...match.teamAPlayerIds, ...match.teamBPlayerIds]) {
        matchCountPerPlayer.set(id, (matchCountPerPlayer.get(id) || 0) + 1);
      }
    }
  }
  const avgMatches = Math.round(
    [...matchCountPerPlayer.values()].reduce((a, b) => a + b, 0) / playerIds.length
  );

  return {
    rounds,
    totalRounds: rounds.length,
    matchesPerPlayer: avgMatches,
    pointsPerMatch,
  };
}

/**
 * Convert Americano schedule to DB-ready match rows
 */
export function americanoMatchesToDbRows(
  schedule: AmericanoSchedule,
  tournamentId: string,
  tenantId: string
) {
  return schedule.rounds.flatMap((round) =>
    round.matches.map((match) => ({
      id: match.id,
      tournament_id: tournamentId,
      tenant_id: tenantId,
      round: match.round,
      match_number: match.matchNumber,
      team_a_player_ids: match.teamAPlayerIds,
      team_b_player_ids: match.teamBPlayerIds,
      status: 'scheduled' as const,
      metadata: {
        court: match.court,
        points_per_match: schedule.pointsPerMatch,
        format: 'americano',
      },
    }))
  );
}
