-- ============================================================
-- Culto Pádel — Seed Data for CPAM Tenant
-- Run after all migrations are applied
-- ============================================================

-- Tournament Categories for CPAM
INSERT INTO tournament_categories (tenant_id, name, slug, gender, level_min, level_max, sort_order)
SELECT t.id, cat.name, cat.slug, cat.gender::gender_type, cat.level_min::player_level, cat.level_max::player_level, cat.sort_order
FROM tenants t,
(VALUES
  ('Varonil A', 'varonil-a', 'male', 'advanced', 'pro', 1),
  ('Varonil B', 'varonil-b', 'male', 'beginner', 'intermediate', 2),
  ('Femenil', 'femenil', 'female', 'beginner', 'pro', 3),
  ('Mixto', 'mixto', 'mixed', 'beginner', 'pro', 4)
) AS cat(name, slug, gender, level_min, level_max, sort_order)
WHERE t.slug = 'cpam'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ============================================================
-- Tournaments for CPAM
-- ============================================================

-- 1. CPAM Fecha 4 — Varonil A
INSERT INTO tournaments (tenant_id, name, slug, format, status, category_id, start_date, end_date, registration_opens, registration_deadline, max_teams, entry_fee, is_public, is_featured, current_registrations)
SELECT
  t.id,
  'CPAM Fecha 4 — Varonil A',
  'fecha-4-varonil-a',
  'americano'::tournament_format,
  'registration'::tournament_status,
  tc.id,
  '2026-03-22 09:00:00-06',
  '2026-03-22 17:00:00-06',
  '2026-03-09 00:00:00-06',
  '2026-03-21 23:59:00-06',
  24,
  450.00,
  true,
  true,
  20
FROM tenants t
JOIN tournament_categories tc ON tc.tenant_id = t.id AND tc.slug = 'varonil-a'
WHERE t.slug = 'cpam'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- 2. CPAM Fecha 4 — Varonil B
INSERT INTO tournaments (tenant_id, name, slug, format, status, category_id, start_date, end_date, registration_opens, registration_deadline, max_teams, entry_fee, is_public, is_featured, current_registrations)
SELECT
  t.id,
  'CPAM Fecha 4 — Varonil B',
  'fecha-4-varonil-b',
  'americano'::tournament_format,
  'registration'::tournament_status,
  tc.id,
  '2026-03-22 09:00:00-06',
  '2026-03-22 17:00:00-06',
  '2026-03-09 00:00:00-06',
  '2026-03-21 23:59:00-06',
  24,
  400.00,
  true,
  true,
  18
FROM tenants t
JOIN tournament_categories tc ON tc.tenant_id = t.id AND tc.slug = 'varonil-b'
WHERE t.slug = 'cpam'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- 3. CPAM Fecha 4 — Mixto
INSERT INTO tournaments (tenant_id, name, slug, format, status, category_id, start_date, end_date, registration_opens, registration_deadline, max_teams, entry_fee, is_public, is_featured, current_registrations)
SELECT
  t.id,
  'CPAM Fecha 4 — Mixto',
  'fecha-4-mixto',
  'americano'::tournament_format,
  'registration'::tournament_status,
  tc.id,
  '2026-03-23 09:00:00-06',
  '2026-03-23 17:00:00-06',
  '2026-03-09 00:00:00-06',
  '2026-03-22 23:59:00-06',
  16,
  500.00,
  true,
  true,
  14
FROM tenants t
JOIN tournament_categories tc ON tc.tenant_id = t.id AND tc.slug = 'mixto'
WHERE t.slug = 'cpam'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- 4. CPAM Fecha 5 — Varonil A
INSERT INTO tournaments (tenant_id, name, slug, format, status, category_id, start_date, end_date, registration_opens, registration_deadline, max_teams, entry_fee, is_public, is_featured, current_registrations)
SELECT
  t.id,
  'CPAM Fecha 5 — Varonil A',
  'fecha-5-varonil-a',
  'americano'::tournament_format,
  'registration'::tournament_status,
  tc.id,
  '2026-04-05 09:00:00-06',
  '2026-04-05 17:00:00-06',
  '2026-03-22 00:00:00-06',
  '2026-04-04 23:59:00-06',
  24,
  450.00,
  true,
  true,
  6
FROM tenants t
JOIN tournament_categories tc ON tc.tenant_id = t.id AND tc.slug = 'varonil-a'
WHERE t.slug = 'cpam'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- 5. Americano Social Nocturno
INSERT INTO tournaments (tenant_id, name, slug, format, status, category_id, start_date, end_date, registration_opens, registration_deadline, max_teams, entry_fee, is_public, is_featured, current_registrations, description)
SELECT
  t.id,
  'Americano Social Nocturno',
  'americano-social-nocturno',
  'americano'::tournament_format,
  'registration'::tournament_status,
  tc.id,
  '2026-03-28 19:00:00-06',
  '2026-03-28 23:00:00-06',
  '2026-03-15 00:00:00-06',
  '2026-03-27 23:59:00-06',
  16,
  350.00,
  true,
  false,
  8,
  'Torneo social nocturno para todos los niveles. Ven a disfrutar del pádel en un ambiente relajado.'
FROM tenants t
JOIN tournament_categories tc ON tc.tenant_id = t.id AND tc.slug = 'mixto'
WHERE t.slug = 'cpam'
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- 6. Torneo Relámpago Femenil
INSERT INTO tournaments (tenant_id, name, slug, format, status, category_id, start_date, end_date, registration_opens, registration_deadline, max_teams, entry_fee, is_public, is_featured, current_registrations, description)
SELECT
  t.id,
  'Torneo Relámpago Femenil',
  'torneo-relampago-femenil',
  'knockout'::tournament_format,
  'registration'::tournament_status,
  tc.id,
  '2026-04-06 10:00:00-06',
  '2026-04-06 18:00:00-06',
  '2026-03-23 00:00:00-06',
  '2026-04-05 23:59:00-06',
  16,
  400.00,
  true,
  true,
  10,
  'Torneo de eliminación directa exclusivo femenil. ¡Demuestra quién es la reina de la cancha!'
FROM tenants t
JOIN tournament_categories tc ON tc.tenant_id = t.id AND tc.slug = 'femenil'
WHERE t.slug = 'cpam'
ON CONFLICT (tenant_id, slug) DO NOTHING;
