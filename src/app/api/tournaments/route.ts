import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { slugify } from '@/lib/utils';
import type { TournamentStatus } from '@/types/database';

const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  format: z.enum([
    'americano', 'mexicano', 'mixed_americano', 'mixed_mexicano',
    'team_americano', 'knockout', 'double_elimination',
    'round_robin', 'swiss', 'league', 'hybrid', 'custom',
  ]),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  registrationOpens: z.string().optional(),
  registrationDeadline: z.string().optional(),
  maxTeams: z.number().min(2).optional(),
  entryFee: z.number().min(0).default(0),
  prizePoll: z.record(z.string(), z.number()).optional(),
  isPublic: z.boolean().default(true),
  scoringSystem: z.object({
    pointsPerMatch: z.number().default(32),
    winBy: z.number().default(0),
    setsToWin: z.number().default(0),
  }).optional(),
  roundDurationMinutes: z.number().default(25),
});

// GET /api/tournaments — list tournaments for current tenant
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const isPublic = searchParams.get('public');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('tournaments')
      .select('*, tournament_categories(name, gender)')
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status as TournamentStatus);
    if (isPublic === 'true') query = query.eq('is_public', true);

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ tournaments: data });
  } catch (error) {
    console.error('List tournaments error:', error);
    return NextResponse.json({ error: 'Error al listar torneos' }, { status: 500 });
  }
}

// POST /api/tournaments — create tournament
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTournamentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || !['tenant_owner', 'tenant_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const slug = slugify(parsed.data.name);

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({
        tenant_id: profile.tenant_id,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        format: parsed.data.format,
        category_id: parsed.data.categoryId,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate,
        registration_opens: parsed.data.registrationOpens,
        registration_deadline: parsed.data.registrationDeadline,
        max_teams: parsed.data.maxTeams,
        entry_fee: parsed.data.entryFee,
        prize_pool: parsed.data.prizePoll || {},
        is_public: parsed.data.isPublic,
        scoring_system: parsed.data.scoringSystem || { points_per_match: 32, win_by: 0, sets_to_win: 0 },
        round_duration_minutes: parsed.data.roundDurationMinutes,
        status: 'draft',
      } as any)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    console.error('Create tournament error:', error);
    return NextResponse.json({ error: 'Error al crear torneo' }, { status: 500 });
  }
}
