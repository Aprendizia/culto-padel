-- ============================================================
-- MIGRATION 002: Multi-Tenant V2
-- Global Users + Tenant Memberships + Anonymous RLS + Tenant Resolution
-- Runs AFTER 001_initial_schema.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. GLOBAL USERS TABLE
-- ============================================================

-- Create global users table (1:1 with auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  first_name text,
  last_name text,
  display_name text GENERATED ALWAYS AS (
    COALESCE(first_name || ' ' || last_name, first_name, last_name, 'Jugador')
  ) STORED,
  avatar_url text,
  date_of_birth date,
  gender gender_type,
  preferred_hand text CHECK (preferred_hand IN ('right', 'left')),
  preferred_side text CHECK (preferred_side IN ('drive', 'reves')),
  bio text,
  is_active boolean NOT NULL DEFAULT true,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone ON public.users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_name_search ON public.users USING gin(
  (first_name || ' ' || last_name) gin_trgm_ops
);

-- Auto-update updated_at
CREATE TRIGGER tr_users_updated BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. TENANT MEMBERSHIPS TABLE
-- ============================================================

CREATE TABLE tenant_memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'player',
  player_level player_level DEFAULT 'beginner',
  ranking_points int NOT NULL DEFAULT 0,
  whatsapp_opted_in boolean NOT NULL DEFAULT false,
  permissions jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_memberships_tenant ON tenant_memberships(tenant_id);
CREATE INDEX idx_memberships_user ON tenant_memberships(user_id);
CREATE INDEX idx_memberships_role ON tenant_memberships(tenant_id, role);
CREATE INDEX idx_memberships_ranking ON tenant_memberships(tenant_id, ranking_points DESC);

-- ============================================================
-- 3. DATA MIGRATION: profiles → users + tenant_memberships
-- ============================================================

-- Migrate profile data into global users table
INSERT INTO public.users (
  id, email, phone, first_name, last_name, avatar_url,
  date_of_birth, gender, preferred_hand, preferred_side,
  bio, is_active, stripe_customer_id, created_at, updated_at
)
SELECT
  p.id, p.email, p.phone, p.first_name, p.last_name, p.avatar_url,
  p.date_of_birth, p.gender, p.preferred_hand, p.preferred_side,
  p.bio, p.is_active, p.stripe_customer_id, p.created_at, p.updated_at
FROM profiles p
ON CONFLICT (id) DO NOTHING;

-- Migrate tenant-specific data into memberships
INSERT INTO tenant_memberships (
  tenant_id, user_id, role, player_level, ranking_points,
  whatsapp_opted_in, metadata, is_active, joined_at
)
SELECT
  p.tenant_id, p.id, p.role, p.player_level, p.ranking_points,
  p.whatsapp_opted_in, COALESCE(p.metadata, '{}'), p.is_active, p.created_at
FROM profiles p
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- ============================================================
-- 4. RE-POINT FOREIGN KEYS: profiles(id) → users(id)
-- ============================================================

-- tournament_registrations.player_1_id
ALTER TABLE tournament_registrations
  DROP CONSTRAINT IF EXISTS tournament_registrations_player_1_id_fkey;
ALTER TABLE tournament_registrations
  ADD CONSTRAINT tournament_registrations_player_1_id_fkey
  FOREIGN KEY (player_1_id) REFERENCES public.users(id);

-- tournament_registrations.player_2_id
ALTER TABLE tournament_registrations
  DROP CONSTRAINT IF EXISTS tournament_registrations_player_2_id_fkey;
ALTER TABLE tournament_registrations
  ADD CONSTRAINT tournament_registrations_player_2_id_fkey
  FOREIGN KEY (player_2_id) REFERENCES public.users(id);

-- standings.player_id
ALTER TABLE standings
  DROP CONSTRAINT IF EXISTS standings_player_id_fkey;
ALTER TABLE standings
  ADD CONSTRAINT standings_player_id_fkey
  FOREIGN KEY (player_id) REFERENCES public.users(id);

-- orders.customer_id
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE orders
  ADD CONSTRAINT orders_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.users(id);

-- messages.from_user_id
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_from_user_id_fkey;
ALTER TABLE messages
  ADD CONSTRAINT messages_from_user_id_fkey
  FOREIGN KEY (from_user_id) REFERENCES public.users(id);

-- messages.to_user_id
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_to_user_id_fkey;
ALTER TABLE messages
  ADD CONSTRAINT messages_to_user_id_fkey
  FOREIGN KEY (to_user_id) REFERENCES public.users(id);

-- notifications.user_id
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- analytics_events.user_id
ALTER TABLE analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_user_id_fkey;
ALTER TABLE analytics_events
  ADD CONSTRAINT analytics_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- ai_interactions.user_id
ALTER TABLE ai_interactions
  DROP CONSTRAINT IF EXISTS ai_interactions_user_id_fkey;
ALTER TABLE ai_interactions
  ADD CONSTRAINT ai_interactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- broadcast_campaigns.created_by
ALTER TABLE broadcast_campaigns
  DROP CONSTRAINT IF EXISTS broadcast_campaigns_created_by_fkey;
ALTER TABLE broadcast_campaigns
  ADD CONSTRAINT broadcast_campaigns_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id);

-- ============================================================
-- 5. DROP OLD TABLES
-- ============================================================

-- Drop RLS policies on profiles first
DROP POLICY IF EXISTS "Users see own tenant profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;

-- Drop trigger on profiles
DROP TRIGGER IF EXISTS tr_profiles_updated ON profiles;

-- Rename profiles to deprecated (safer than DROP for rollback)
ALTER TABLE profiles RENAME TO profiles_deprecated;

-- Drop team_members (replaced by tenant_memberships)
DROP POLICY IF EXISTS "tenant_isolation" ON team_members;
DROP TABLE team_members;

-- ============================================================
-- 6. UPDATED HELPER FUNCTIONS
-- ============================================================

-- Get user's tenant_id (backwards compat: JWT claim → first active membership)
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    -- First try JWT custom claim
    (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid,
    -- Fallback: first active membership
    (SELECT tenant_id FROM tenant_memberships
     WHERE user_id = auth.uid() AND is_active = true
     ORDER BY joined_at ASC LIMIT 1)
  );
$$;

-- Check if user has specific role within a tenant
CREATE OR REPLACE FUNCTION auth.has_role(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = auth.tenant_id()
      AND role = required_role
      AND is_active = true
  );
$$;

-- Check if user is admin of their current tenant
CREATE OR REPLACE FUNCTION auth.is_tenant_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = auth.tenant_id()
      AND role IN ('tenant_owner', 'tenant_admin', 'super_admin')
      AND is_active = true
  );
$$;

-- Check role within a SPECIFIC tenant (multi-tenant aware)
CREATE OR REPLACE FUNCTION auth.has_tenant_role(p_tenant_id uuid, required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = p_tenant_id
      AND role = required_role
      AND is_active = true
  );
$$;

-- Check if admin of a SPECIFIC tenant
CREATE OR REPLACE FUNCTION auth.is_tenant_admin_of(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = p_tenant_id
      AND role IN ('tenant_owner', 'tenant_admin', 'super_admin')
      AND is_active = true
  );
$$;

-- ============================================================
-- 7. TENANT RESOLUTION RPC
-- ============================================================

-- Public-safe tenant resolution (no sensitive fields)
CREATE OR REPLACE FUNCTION resolve_tenant(p_slug text DEFAULT NULL, p_domain text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', t.id,
    'name', t.name,
    'slug', t.slug,
    'custom_domain', t.custom_domain,
    'logo_url', t.logo_url,
    'favicon_url', t.favicon_url,
    'brand_colors', t.brand_colors,
    'settings', t.settings,
    'features', t.features,
    'plan_name', p.name,
    'stripe_onboarding_complete', t.stripe_onboarding_complete,
    'is_active', t.is_active
  ) INTO result
  FROM tenants t
  LEFT JOIN plans p ON p.id = t.plan_id
  WHERE t.is_active = true
    AND (
      (p_slug IS NOT NULL AND t.slug = p_slug)
      OR (p_domain IS NOT NULL AND t.custom_domain = p_domain)
    )
  LIMIT 1;

  RETURN result;
END;
$$;

-- Private tenant details (authenticated admins only — includes Stripe, commission, WhatsApp)
CREATE OR REPLACE FUNCTION resolve_tenant_private(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verify caller is admin of this tenant
  IF NOT auth.is_tenant_admin_of(p_tenant_id) THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'stripe_account_id', t.stripe_account_id,
    'stripe_customer_id', t.stripe_customer_id,
    'commission_rate', p.commission_rate,
    'whatsapp_phone', t.whatsapp_phone,
    'whatsapp_status', t.whatsapp_status,
    'email', t.email,
    'phone', t.phone,
    'subscription_status', t.subscription_status,
    'trial_ends_at', t.trial_ends_at
  ) INTO result
  FROM tenants t
  LEFT JOIN plans p ON p.id = t.plan_id
  WHERE t.id = p_tenant_id;

  RETURN result;
END;
$$;

-- Simple helper: get tenant UUID by slug
CREATE OR REPLACE FUNCTION get_tenant_id_by_slug(p_slug text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM tenants WHERE slug = p_slug AND is_active = true LIMIT 1;
$$;

-- Simple helper: get tenant UUID by custom domain
CREATE OR REPLACE FUNCTION get_tenant_id_by_domain(p_domain text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM tenants WHERE custom_domain = p_domain AND is_active = true LIMIT 1;
$$;

-- ============================================================
-- 8. RLS ON PUBLIC.USERS
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can read basic user info (needed for standings, match display)
CREATE POLICY "public_user_profiles" ON public.users
  FOR SELECT USING (true);

-- Users update their own row
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Only authenticated users can insert their own row (fallback for edge cases;
-- normal flow is via handle_new_user trigger which uses SECURITY DEFINER)
CREATE POLICY "auth_insert_own_user" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- 9. RLS ON TENANT_MEMBERSHIPS
-- ============================================================

ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Users see memberships in their own tenants
CREATE POLICY "members_see_tenant" ON tenant_memberships
  FOR SELECT USING (
    -- User sees their own memberships
    user_id = auth.uid()
    -- Or anyone in the same tenant can see fellow members
    OR tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

-- Admins manage memberships in their tenant
CREATE POLICY "admins_manage_memberships" ON tenant_memberships
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- Authenticated users can join a tenant themselves (self-registration)
-- Auto-join trigger uses SECURITY DEFINER so it bypasses RLS
CREATE POLICY "auth_self_join_tenant" ON tenant_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 10. FIX RLS POLICIES FOR ANONYMOUS PUBLIC ACCESS
-- ============================================================

-- ---------- TENANTS ----------
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_tenant_info" ON tenants
  FOR SELECT USING (is_active = true);

CREATE POLICY "super_admins_manage_tenants" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_memberships
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
  );

-- ---------- TOURNAMENTS ----------
-- Drop existing policies
DROP POLICY IF EXISTS "public_tournaments_visible" ON tournaments;
DROP POLICY IF EXISTS "admins_manage" ON tournaments;

-- Anon: see public tournaments (app filters by tenant_id in query)
CREATE POLICY "public_tournaments_visible" ON tournaments
  FOR SELECT USING (
    is_public = true AND status IN ('registration', 'active', 'completed')
  );

-- Authenticated tenant members see ALL tournaments (including drafts)
CREATE POLICY "tenant_members_see_all" ON tournaments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_memberships
      WHERE user_id = auth.uid()
        AND tenant_id = tournaments.tenant_id
        AND is_active = true
    )
  );

-- Admins manage tournaments in their tenant
CREATE POLICY "admins_manage_tournaments" ON tournaments
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- TOURNAMENT CATEGORIES ----------
DROP POLICY IF EXISTS "tenant_isolation" ON tournament_categories;
DROP POLICY IF EXISTS "admins_manage" ON tournament_categories;

-- Anon: see active categories
CREATE POLICY "public_categories" ON tournament_categories
  FOR SELECT USING (is_active = true);

-- Admins manage
CREATE POLICY "admins_manage_categories" ON tournament_categories
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- STANDINGS ----------
DROP POLICY IF EXISTS "tenant_read" ON standings;
DROP POLICY IF EXISTS "admins_manage" ON standings;

-- Anon: see standings for public tournaments
CREATE POLICY "public_standings" ON standings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE id = standings.tournament_id AND is_public = true
    )
  );

-- Admins manage
CREATE POLICY "admins_manage_standings" ON standings
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- COURTS ----------
DROP POLICY IF EXISTS "tenant_isolation" ON courts;
DROP POLICY IF EXISTS "admins_manage" ON courts;

-- Anon: see available courts
CREATE POLICY "public_courts" ON courts
  FOR SELECT USING (status = 'available');

-- Tenant members see all courts
CREATE POLICY "members_see_courts" ON courts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_memberships
      WHERE user_id = auth.uid()
        AND tenant_id = courts.tenant_id
        AND is_active = true
    )
  );

-- Admins manage
CREATE POLICY "admins_manage_courts" ON courts
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- PRODUCTS ----------
-- Existing "public_products" policy already handles anon via is_active = true
-- But let's clean it up to be explicit
DROP POLICY IF EXISTS "public_products" ON products;
DROP POLICY IF EXISTS "admins_manage" ON products;

CREATE POLICY "public_products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "admins_see_all_products" ON products
  FOR SELECT USING (
    auth.is_tenant_admin_of(tenant_id)
  );

CREATE POLICY "admins_manage_products" ON products
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- MATCHES ----------
DROP POLICY IF EXISTS "tenant_read" ON matches;
DROP POLICY IF EXISTS "admins_manage" ON matches;

-- Anon: see matches for public tournaments
CREATE POLICY "public_matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE id = matches.tournament_id AND is_public = true
    )
  );

-- Tenant members see all matches
CREATE POLICY "members_see_matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_memberships
      WHERE user_id = auth.uid()
        AND tenant_id = matches.tenant_id
        AND is_active = true
    )
  );

-- Admins manage
CREATE POLICY "admins_manage_matches" ON matches
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- TOURNAMENT REGISTRATIONS ----------
-- Update to use users table instead of profiles
DROP POLICY IF EXISTS "players_see_own" ON tournament_registrations;
DROP POLICY IF EXISTS "players_register" ON tournament_registrations;
DROP POLICY IF EXISTS "admins_manage" ON tournament_registrations;

-- Anon: see registrations for public tournaments (for bracket display)
CREATE POLICY "public_registrations" ON tournament_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE id = tournament_registrations.tournament_id AND is_public = true
    )
  );

-- Players see their own registrations
CREATE POLICY "players_see_own_registrations" ON tournament_registrations
  FOR SELECT USING (
    player_1_id = auth.uid() OR player_2_id = auth.uid()
  );

-- Players can register themselves
CREATE POLICY "players_register" ON tournament_registrations
  FOR INSERT WITH CHECK (
    player_1_id = auth.uid()
  );

-- Admins manage
CREATE POLICY "admins_manage_registrations" ON tournament_registrations
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- ORDERS ----------
-- Update to use users table
DROP POLICY IF EXISTS "customers_see_own" ON orders;
DROP POLICY IF EXISTS "admins_manage" ON orders;

CREATE POLICY "customers_see_own_orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "admins_manage_orders" ON orders
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- MESSAGES ----------
DROP POLICY IF EXISTS "users_see_own" ON messages;

CREATE POLICY "users_see_own_messages" ON messages
  FOR SELECT USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- NOTIFICATIONS ----------
DROP POLICY IF EXISTS "users_see_own" ON notifications;
DROP POLICY IF EXISTS "admins_manage" ON notifications;

CREATE POLICY "users_see_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_mark_read_notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "admins_manage_notifications" ON notifications
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- BROADCAST CAMPAIGNS ----------
DROP POLICY IF EXISTS "admins_only" ON broadcast_campaigns;

CREATE POLICY "admins_manage_campaigns" ON broadcast_campaigns
  FOR ALL USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ---------- ANALYTICS EVENTS ----------
DROP POLICY IF EXISTS "admins_read" ON analytics_events;
DROP POLICY IF EXISTS "system_insert" ON analytics_events;

CREATE POLICY "admins_read_analytics" ON analytics_events
  FOR SELECT USING (
    auth.is_tenant_admin_of(tenant_id)
  );

CREATE POLICY "system_insert_analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- ---------- AI INTERACTIONS ----------
DROP POLICY IF EXISTS "admins_read" ON ai_interactions;

CREATE POLICY "admins_read_ai" ON ai_interactions
  FOR SELECT USING (
    auth.is_tenant_admin_of(tenant_id)
  );

-- ============================================================
-- 11. CONNECT REGISTRATIONS → ORDERS
-- ============================================================

ALTER TABLE tournament_registrations
  ADD COLUMN order_id uuid REFERENCES orders(id);

CREATE INDEX idx_registrations_order
  ON tournament_registrations(order_id)
  WHERE order_id IS NOT NULL;

-- ============================================================
-- 12. TRIGGER: auth.users → public.users
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 13. AUTO-JOIN TENANT ON REGISTRATION
-- ============================================================

-- Ensures a user has a membership in a tenant; creates one if not.
-- Returns the membership id.
CREATE OR REPLACE FUNCTION ensure_tenant_membership(p_user_id uuid, p_tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_membership_id uuid;
BEGIN
  -- Try to find existing membership
  SELECT id INTO v_membership_id
  FROM tenant_memberships
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id;

  IF v_membership_id IS NOT NULL THEN
    -- Reactivate if it was deactivated
    UPDATE tenant_memberships
    SET is_active = true
    WHERE id = v_membership_id AND is_active = false;

    RETURN v_membership_id;
  END IF;

  -- Create new membership
  INSERT INTO tenant_memberships (tenant_id, user_id, role)
  VALUES (p_tenant_id, p_user_id, 'player')
  RETURNING id INTO v_membership_id;

  RETURN v_membership_id;
END;
$$;

-- Trigger: auto-join tenant when registering for a tournament
CREATE OR REPLACE FUNCTION auto_join_tenant_on_registration()
RETURNS trigger AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- Get tenant_id from the tournament
  SELECT tenant_id INTO v_tenant_id
  FROM tournaments WHERE id = NEW.tournament_id;

  IF v_tenant_id IS NOT NULL THEN
    -- Ensure player_1 has membership
    PERFORM ensure_tenant_membership(NEW.player_1_id, v_tenant_id);

    -- Ensure player_2 has membership (if present)
    IF NEW.player_2_id IS NOT NULL THEN
      PERFORM ensure_tenant_membership(NEW.player_2_id, v_tenant_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_auto_join_tenant
  AFTER INSERT ON tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION auto_join_tenant_on_registration();

-- ============================================================
-- 14. WAITLIST TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION auto_waitlist_registration()
RETURNS trigger AS $$
DECLARE
  v_max_teams int;
  v_current int;
BEGIN
  -- Only apply to new registrations or status changes
  IF NEW.status NOT IN ('pending', 'confirmed', 'paid') THEN
    RETURN NEW;
  END IF;

  SELECT max_teams, current_registrations
  INTO v_max_teams, v_current
  FROM tournaments WHERE id = NEW.tournament_id;

  -- If tournament has a cap and it's full, waitlist
  IF v_max_teams IS NOT NULL AND v_current >= v_max_teams THEN
    NEW.status := 'waitlisted';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auto_waitlist
  BEFORE INSERT ON tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION auto_waitlist_registration();

-- ============================================================
-- 15. UPDATED VIEWS
-- ============================================================

-- Tournament overview (unchanged structure, still works)
CREATE OR REPLACE VIEW v_tournament_overview AS
SELECT
  t.*,
  tc.name AS category_name,
  tc.gender AS category_gender,
  COUNT(tr.id) FILTER (WHERE tr.status IN ('confirmed', 'paid')) AS confirmed_count,
  COUNT(tr.id) FILTER (WHERE tr.status = 'waitlisted') AS waitlisted_count,
  CASE
    WHEN t.max_teams IS NOT NULL AND t.current_registrations >= t.max_teams THEN true
    ELSE false
  END AS is_full
FROM tournaments t
LEFT JOIN tournament_categories tc ON tc.id = t.category_id
LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
GROUP BY t.id, tc.name, tc.gender;

-- Player stats: now uses users + tenant_memberships
-- IMPORTANT: standings filtered by tenant_id to prevent cross-tenant stat leaks
CREATE OR REPLACE VIEW v_player_stats AS
SELECT
  u.id AS player_id,
  tm.tenant_id,
  u.display_name,
  tm.player_level,
  tm.ranking_points,
  COUNT(DISTINCT s.tournament_id) AS tournaments_played,
  COALESCE(SUM(s.matches_played), 0) AS total_matches,
  COALESCE(SUM(s.matches_won), 0) AS total_wins,
  COALESCE(SUM(s.matches_lost), 0) AS total_losses,
  COALESCE(SUM(s.points_for), 0) AS total_points_for,
  COALESCE(SUM(s.points_against), 0) AS total_points_against,
  CASE
    WHEN COALESCE(SUM(s.matches_played), 0) > 0
    THEN ROUND(SUM(s.matches_won)::decimal / SUM(s.matches_played) * 100, 1)
    ELSE 0
  END AS win_percentage
FROM public.users u
JOIN tenant_memberships tm ON tm.user_id = u.id AND tm.is_active = true
LEFT JOIN standings s ON s.player_id = u.id AND s.tenant_id = tm.tenant_id
WHERE tm.role = 'player'
GROUP BY u.id, tm.tenant_id, u.display_name, tm.player_level, tm.ranking_points;

-- Tenant dashboard metrics: uses scalar subqueries to avoid cartesian product
CREATE OR REPLACE VIEW v_tenant_metrics AS
SELECT
  t.id AS tenant_id,
  t.name,
  (SELECT COUNT(*) FROM tenant_memberships tm
   WHERE tm.tenant_id = t.id AND tm.is_active = true) AS total_players,
  (SELECT COUNT(*) FROM tournaments tour
   WHERE tour.tenant_id = t.id AND tour.status = 'active') AS active_tournaments,
  (SELECT COUNT(*) FROM orders o
   WHERE o.tenant_id = t.id AND o.status = 'paid') AS total_orders,
  (SELECT COALESCE(SUM(o.total), 0) FROM orders o
   WHERE o.tenant_id = t.id AND o.status = 'paid') AS total_revenue,
  (SELECT COUNT(*) FROM messages m
   WHERE m.tenant_id = t.id AND m.created_at > now() - interval '24 hours') AS messages_24h
FROM tenants t;

-- ============================================================
-- 16. GRANT ANON/AUTHENTICATED ACCESS TO NEW OBJECTS
-- ============================================================

-- Supabase roles need explicit access to new tables and functions
GRANT SELECT ON public.users TO anon, authenticated;
GRANT INSERT, UPDATE ON public.users TO authenticated;

GRANT SELECT ON tenant_memberships TO anon, authenticated;
GRANT INSERT, UPDATE ON tenant_memberships TO authenticated;

GRANT EXECUTE ON FUNCTION resolve_tenant(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION resolve_tenant_private(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_id_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_id_by_domain(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION ensure_tenant_membership(uuid, uuid) TO authenticated;

GRANT SELECT ON v_player_stats TO anon, authenticated;
GRANT SELECT ON v_tournament_overview TO anon, authenticated;
GRANT SELECT ON v_tenant_metrics TO authenticated;

-- ============================================================
-- 17. SEED TENANTS
-- ============================================================

-- CPAM - Circuito de Pádel Amateur Mexicano
INSERT INTO tenants (name, slug, custom_domain, brand_colors, logo_url, settings)
VALUES (
  'Circuito de Pádel Amateur Mexicano',
  'cpam',
  'cpam.com.mx',
  '{"primary": "#F5A623", "secondary": "#1D1D1B", "accent": "#F5A623", "background": "#FFFFFF"}'::jsonb,
  '/brands/cpam/logo-orange.png',
  '{"timezone": "America/Mexico_City", "currency": "MXN", "locale": "es-MX", "default_points_per_match": 32, "default_match_duration_minutes": 25}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Culto Pádel - Platform demo tenant
INSERT INTO tenants (name, slug, brand_colors, logo_url, settings)
VALUES (
  'Culto Pádel',
  'culto',
  '{"primary": "#C5A55A", "secondary": "#0A0A0A", "accent": "#D4B86A", "background": "#0A0A0A"}'::jsonb,
  '/brands/culto/logo.svg',
  '{"timezone": "America/Mexico_City", "currency": "MXN", "locale": "es-MX", "default_points_per_match": 32, "default_match_duration_minutes": 25}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ============================================================
-- MIGRATION SUMMARY
-- ============================================================
-- New tables: public.users, tenant_memberships
-- Deprecated: profiles → profiles_deprecated
-- Dropped: team_members
-- New column: tournament_registrations.order_id
-- New functions: resolve_tenant, get_tenant_id_by_slug, get_tenant_id_by_domain,
--   auth.has_tenant_role, auth.is_tenant_admin_of, ensure_tenant_membership,
--   handle_new_user, auto_join_tenant_on_registration, auto_waitlist_registration
-- Updated functions: auth.tenant_id, auth.has_role, auth.is_tenant_admin
-- New triggers: on_auth_user_created, tr_auto_join_tenant, tr_auto_waitlist
-- Updated views: v_player_stats, v_tournament_overview, v_tenant_metrics
-- RLS: All policies updated for anon access + tenant_memberships
-- Seed: CPAM + Culto Pádel tenants
