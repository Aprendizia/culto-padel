import { nextPowerOf2, generateId } from '@/lib/utils';

export interface BracketRegistration {
  id: string;
  seed?: number;
  teamName?: string;
  player1Id: string;
  player2Id?: string;
}

export interface BracketMatch {
  id: string;
  tournamentId: string;
  tenantId: string;
  round: number;
  matchNumber: number;
  teamARegistrationId: string | null;
  teamBRegistrationId: string | null;
  nextMatchId: string | null;
  nextMatchSlot: 'a' | 'b' | null;
  status: 'scheduled' | 'walkover';
  isBye: boolean;
}

const BYE_MARKER = '__BYE__';

/**
 * Standard seeding positions for knockout brackets.
 * Places seed 1 vs last seed, 2 vs second-to-last, etc.
 * Ensures top seeds meet as late as possible.
 */
function generateSeedOrder(size: number): number[] {
  if (size === 1) return [0];
  if (size === 2) return [0, 1];

  const half = size / 2;
  const previousOrder = generateSeedOrder(half);

  const result: number[] = [];
  for (const pos of previousOrder) {
    result.push(pos);
    result.push(size - 1 - pos);
  }
  return result;
}

/**
 * Generate a complete single-elimination knockout bracket.
 *
 * Features:
 * - Pads to next power of 2 with BYEs
 * - Proper seeding (1v8, 4v5, 2v7, 3v6 for 8-team)
 * - All rounds pre-generated with match links
 * - BYE matches auto-resolved as walkovers
 */
export function generateKnockoutBracket(
  registrations: BracketRegistration[],
  tournamentId: string,
  tenantId: string
): BracketMatch[] {
  if (registrations.length < 2) {
    throw new Error('At least 2 registrations are required to generate a bracket');
  }

  const bracketSize = nextPowerOf2(registrations.length);
  const totalRounds = Math.log2(bracketSize);

  // Sort by seed (seeded first, then random for unseeded)
  const sorted = [...registrations].sort((a, b) => {
    if (a.seed !== undefined && b.seed !== undefined) return a.seed - b.seed;
    if (a.seed !== undefined) return -1;
    if (b.seed !== undefined) return 1;
    return Math.random() - 0.5;
  });

  // Pad with BYEs
  const padded: (BracketRegistration | null)[] = [...sorted];
  while (padded.length < bracketSize) {
    padded.push(null);
  }

  // Apply seed order
  const seedOrder = generateSeedOrder(bracketSize);
  const positioned: (BracketRegistration | null)[] = new Array(bracketSize);
  for (let i = 0; i < bracketSize; i++) {
    positioned[seedOrder[i]] = padded[i];
  }

  // Generate all matches for all rounds
  const allMatches: BracketMatch[] = [];
  const matchesByRound: Map<number, BracketMatch[]> = new Map();

  // Generate from final round backward so we can link next_match
  for (let round = totalRounds; round >= 1; round--) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    const roundMatches: BracketMatch[] = [];

    for (let i = 0; i < matchesInRound; i++) {
      const match: BracketMatch = {
        id: generateId(),
        tournamentId,
        tenantId,
        round,
        matchNumber: i + 1,
        teamARegistrationId: null,
        teamBRegistrationId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        status: 'scheduled',
        isBye: false,
      };

      // Link to next round match
      if (round < totalRounds) {
        const nextRoundMatches = matchesByRound.get(round + 1)!;
        const nextMatchIndex = Math.floor(i / 2);
        const nextMatch = nextRoundMatches[nextMatchIndex];
        match.nextMatchId = nextMatch.id;
        match.nextMatchSlot = i % 2 === 0 ? 'a' : 'b';
      }

      roundMatches.push(match);
    }

    matchesByRound.set(round, roundMatches);
    allMatches.push(...roundMatches);
  }

  // Fill in first round teams from positioned array
  const firstRoundMatches = matchesByRound.get(1)!;
  for (let i = 0; i < firstRoundMatches.length; i++) {
    const teamA = positioned[i * 2];
    const teamB = positioned[i * 2 + 1];
    const match = firstRoundMatches[i];

    match.teamARegistrationId = teamA?.id ?? null;
    match.teamBRegistrationId = teamB?.id ?? null;

    // Handle BYEs
    const aIsBye = teamA === null;
    const bIsBye = teamB === null;

    if (aIsBye && bIsBye) {
      match.status = 'walkover';
      match.isBye = true;
    } else if (aIsBye || bIsBye) {
      match.status = 'walkover';
      match.isBye = true;

      // Auto-advance the non-BYE team
      const winnerId = aIsBye ? teamB!.id : teamA!.id;
      if (match.nextMatchId && match.nextMatchSlot) {
        const nextMatch = allMatches.find((m) => m.id === match.nextMatchId)!;
        if (match.nextMatchSlot === 'a') {
          nextMatch.teamARegistrationId = winnerId;
        } else {
          nextMatch.teamBRegistrationId = winnerId;
        }
      }
    }
  }

  // Sort by round ASC, match_number ASC
  return allMatches.sort((a, b) => a.round - b.round || a.matchNumber - b.matchNumber);
}

/**
 * Convert bracket matches to DB-ready insert objects
 */
export function bracketMatchesToDbRows(matches: BracketMatch[]) {
  return matches.map((m) => ({
    id: m.id,
    tournament_id: m.tournamentId,
    tenant_id: m.tenantId,
    round: m.round,
    match_number: m.matchNumber,
    team_a_registration_id: m.teamARegistrationId,
    team_b_registration_id: m.teamBRegistrationId,
    next_match_id: m.nextMatchId,
    next_match_slot: m.nextMatchSlot,
    status: m.status === 'walkover' ? 'walkover' : 'scheduled',
    metadata: m.isBye ? { bye: true } : {},
  }));
}
