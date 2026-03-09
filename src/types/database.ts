// ============================================================
// TypeScript types matching the Culto Pádel V2 multi-tenant schema
// Auto-maintained — keep in sync with supabase/migrations/
// ============================================================

// -- ENUMS --

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'paused';

export type UserRole =
  | 'super_admin'
  | 'tenant_owner'
  | 'tenant_admin'
  | 'coach'
  | 'player'
  | 'spectator';

export type TournamentFormat =
  | 'americano'
  | 'mexicano'
  | 'mixed_americano'
  | 'mixed_mexicano'
  | 'team_americano'
  | 'knockout'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'
  | 'league'
  | 'hybrid'
  | 'custom';

export type TournamentStatus =
  | 'draft'
  | 'registration'
  | 'active'
  | 'paused'
  | 'completed'
  | 'canceled';

export type MatchStatus =
  | 'scheduled'
  | 'warmup'
  | 'live'
  | 'completed'
  | 'walkover'
  | 'canceled';

export type RegistrationStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'waitlisted'
  | 'withdrawn'
  | 'disqualified';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'refunded';

export type MessageChannel = 'whatsapp' | 'web_chat' | 'email' | 'sms' | 'push';
export type MessageDirection = 'inbound' | 'outbound';

export type NotificationType =
  | 'tournament_reminder'
  | 'match_result'
  | 'match_upcoming'
  | 'registration_confirmed'
  | 'order_update'
  | 'payment'
  | 'broadcast'
  | 'system'
  | 'ai_response';

export type CourtType = 'indoor' | 'outdoor' | 'covered';
export type CourtSurface = 'artificial_grass' | 'concrete' | 'panoramic' | 'carpet';
export type PlayerLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type GenderType = 'male' | 'female' | 'mixed' | 'open';

// -- TABLE INTERFACES --

/**
 * Global user record (public.users table).
 * Replaces the old `profiles` table — tenant-specific data lives in TenantMembership.
 */
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null; // generated
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: GenderType | null;
  preferred_hand: 'right' | 'left' | null;
  preferred_side: 'drive' | 'reves' | null;
  bio: string | null;
  is_active: boolean;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use `User` instead. Kept for backward compatibility. */
export type Profile = User;

/**
 * Per-tenant membership record (public.tenant_memberships table).
 * Contains role, level, ranking, and tenant-specific metadata.
 */
export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  player_level: PlayerLevel | null;
  ranking_points: number;
  whatsapp_opted_in: boolean;
  permissions: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_active: boolean;
  joined_at: string;
}

/**
 * Resolved tenant configuration (from resolve_tenant RPC).
 * Used by TenantProvider for client-side context.
 */
export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  settings: {
    timezone: string;
    currency: string;
    locale: string;
    default_points_per_match: number;
    default_match_duration_minutes: number;
  };
  features: Record<string, boolean>;
  plan_name: string | null;
  stripe_onboarding_complete: boolean;
  is_active: boolean;
}

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  max_courts: number;
  max_tournaments_month: number;
  max_players: number;
  max_products: number;
  features: {
    whatsapp_notifications: boolean;
    whatsapp_ai: boolean;
    store: boolean;
    custom_domain: boolean;
    api_access: boolean;
    analytics_advanced: boolean;
    white_label: boolean;
  };
  price_monthly_mxn: number | null;
  price_yearly_mxn: number | null;
  commission_rate: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  plan_id: string | null;
  trial_ends_at: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  settings: {
    timezone: string;
    currency: string;
    locale: string;
    default_points_per_match: number;
    default_match_duration_minutes: number;
  };
  features: Record<string, unknown>;
  whatsapp_phone: string | null;
  whatsapp_session_id: string | null;
  whatsapp_status: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    lat?: number;
    lng?: number;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TeamMember = {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  permissions: Record<string, unknown>;
  invited_by: string | null;
  invited_email: string | null;
  status: 'active' | 'invited' | 'suspended';
  created_at: string;
}

export type Court = {
  id: string;
  tenant_id: string;
  name: string;
  court_number: number | null;
  type: CourtType;
  surface: CourtSurface;
  status: 'available' | 'maintenance' | 'reserved' | 'inactive';
  hourly_rate: number | null;
  peak_rate: number | null;
  has_lighting: boolean;
  has_roof: boolean;
  dimensions: { width?: number; length?: number } | null;
  images: string[];
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type TournamentCategory = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  gender: GenderType | null;
  level_min: PlayerLevel | null;
  level_max: PlayerLevel | null;
  age_min: number | null;
  age_max: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type Tournament = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  format: TournamentFormat;
  status: TournamentStatus;
  category_id: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_opens: string | null;
  registration_deadline: string | null;
  max_teams: number | null;
  min_teams: number;
  current_registrations: number;
  entry_fee: number;
  stripe_price_id: string | null;
  currency: string;
  prize_pool: Record<string, number>;
  rules: Record<string, unknown>;
  scoring_system: {
    points_per_match: number;
    win_by: number;
    sets_to_win: number;
  };
  courts_assigned: string[];
  round_duration_minutes: number;
  break_between_rounds_minutes: number;
  banner_url: string | null;
  is_public: boolean;
  is_featured: boolean;
  ai_generated_description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type TournamentRegistration = {
  id: string;
  tenant_id: string;
  tournament_id: string;
  order_id: string | null;
  player_1_id: string;
  player_2_id: string | null;
  team_name: string | null;
  seed: number | null;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  amount_paid: number | null;
  registered_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  withdrawn_at: string | null;
  metadata: Record<string, unknown>;
}

export type Match = {
  id: string;
  tenant_id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  group_name: string | null;
  court_id: string | null;
  team_a_registration_id: string | null;
  team_b_registration_id: string | null;
  team_a_player_ids: string[];
  team_b_player_ids: string[];
  score_team_a: number;
  score_team_b: number;
  sets: Array<{ a: number; b: number }>;
  winner_registration_id: string | null;
  winner_side: 'a' | 'b' | 'draw' | null;
  status: MatchStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  next_match_id: string | null;
  next_match_slot: 'a' | 'b' | null;
  loser_next_match_id: string | null;
  play_by_play: unknown[];
  stats: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type Standing = {
  id: string;
  tenant_id: string;
  tournament_id: string;
  registration_id: string | null;
  player_id: string | null;
  group_name: string | null;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  points_for: number;
  points_against: number;
  point_diff: number; // generated
  sets_won: number;
  sets_lost: number;
  bonus_points: number;
  total_points: number; // generated
  ranking_position: number | null;
  updated_at: string;
}

export type Product = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  price: number;
  currency: string;
  compare_at_price: number | null;
  inventory_count: number | null;
  track_inventory: boolean;
  allow_backorder: boolean;
  images: string[];
  has_variants: boolean;
  variants: Array<{
    name: string;
    options: string[];
    prices?: Record<string, number>;
  }>;
  is_active: boolean;
  is_digital: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type Order = {
  id: string;
  tenant_id: string;
  order_number: number;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  shipping_address: Record<string, unknown> | null;
  shipping_method: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    variant?: string;
  }>;
  notes: string | null;
  internal_notes: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  refunded_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type Message = {
  id: string;
  tenant_id: string;
  channel: MessageChannel;
  direction: MessageDirection;
  from_user_id: string | null;
  to_user_id: string | null;
  content: string | null;
  media_urls: string[];
  wa_message_id: string | null;
  wa_chat_id: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  context_type: string | null;
  context_id: string | null;
  ai_processed: boolean;
  ai_intent: string | null;
  ai_response: string | null;
  ai_confidence: number | null;
  created_at: string;
}

export type Notification = {
  id: string;
  tenant_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  channel: MessageChannel;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  action_url: string | null;
  data: Record<string, unknown>;
  scheduled_for: string | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

export type BroadcastCampaign = {
  id: string;
  tenant_id: string;
  name: string;
  channel: MessageChannel;
  content: string;
  media_urls: string[];
  target_filter: Record<string, unknown>;
  recipient_count: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'canceled';
  scheduled_for: string | null;
  sent_at: string | null;
  delivered_count: number;
  read_count: number;
  created_by: string | null;
  created_at: string;
}

export type AnalyticsEvent = {
  id: string;
  tenant_id: string;
  user_id: string | null;
  event_type: string;
  properties: Record<string, unknown>;
  session_id: string | null;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export type AiInteraction = {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  agent: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number; // generated
  cost_usd: number;
  input_summary: string | null;
  output_summary: string | null;
  latency_ms: number | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export type StripeEvent = {
  id: string;
  tenant_id: string | null;
  type: string;
  data: Record<string, unknown>;
  processed: boolean;
  processed_at: string | null;
  error: string | null;
  created_at: string;
}

// -- SUPABASE DATABASE TYPE --

export type Database = {
  public: {
    Tables: {
      plans: { Row: Plan; Insert: Partial<Plan> & Pick<Plan, 'name'>; Update: Partial<Plan>; Relationships: never[] };
      tenants: { Row: Tenant; Insert: Partial<Tenant> & Pick<Tenant, 'name' | 'slug'>; Update: Partial<Tenant>; Relationships: never[] };
      users: { Row: User; Insert: Partial<User> & Pick<User, 'id'>; Update: Partial<User>; Relationships: never[] };
      tenant_memberships: { Row: TenantMembership; Insert: Partial<TenantMembership> & Pick<TenantMembership, 'tenant_id' | 'user_id'>; Update: Partial<TenantMembership>; Relationships: never[] };
      team_members: { Row: TeamMember; Insert: Partial<TeamMember> & Pick<TeamMember, 'tenant_id' | 'user_id'>; Update: Partial<TeamMember>; Relationships: never[] };
      courts: { Row: Court; Insert: Partial<Court> & Pick<Court, 'tenant_id' | 'name'>; Update: Partial<Court>; Relationships: never[] };
      tournament_categories: { Row: TournamentCategory; Insert: Partial<TournamentCategory> & Pick<TournamentCategory, 'tenant_id' | 'name' | 'slug'>; Update: Partial<TournamentCategory>; Relationships: never[] };
      tournaments: { Row: Tournament; Insert: Partial<Tournament> & Pick<Tournament, 'tenant_id' | 'name' | 'slug' | 'format'>; Update: Partial<Tournament>; Relationships: never[] };
      tournament_registrations: { Row: TournamentRegistration; Insert: Partial<TournamentRegistration> & Pick<TournamentRegistration, 'tenant_id' | 'tournament_id' | 'player_1_id'>; Update: Partial<TournamentRegistration>; Relationships: never[] };
      matches: { Row: Match; Insert: Partial<Match> & Pick<Match, 'tenant_id' | 'tournament_id' | 'round' | 'match_number'>; Update: Partial<Match>; Relationships: never[] };
      standings: { Row: Standing; Insert: Partial<Standing> & Pick<Standing, 'tenant_id' | 'tournament_id'>; Update: Partial<Standing>; Relationships: never[] };
      products: { Row: Product; Insert: Partial<Product> & Pick<Product, 'tenant_id' | 'name' | 'slug' | 'price'>; Update: Partial<Product>; Relationships: never[] };
      orders: { Row: Order; Insert: Partial<Order> & Pick<Order, 'tenant_id' | 'customer_id'>; Update: Partial<Order>; Relationships: never[] };
      messages: { Row: Message; Insert: Partial<Message> & Pick<Message, 'tenant_id' | 'channel' | 'direction'>; Update: Partial<Message>; Relationships: never[] };
      notifications: { Row: Notification; Insert: Partial<Notification> & Pick<Notification, 'tenant_id' | 'user_id' | 'type' | 'title' | 'body'>; Update: Partial<Notification>; Relationships: never[] };
      broadcast_campaigns: { Row: BroadcastCampaign; Insert: Partial<BroadcastCampaign> & Pick<BroadcastCampaign, 'tenant_id' | 'name' | 'channel' | 'content'>; Update: Partial<BroadcastCampaign>; Relationships: never[] };
      analytics_events: { Row: AnalyticsEvent; Insert: Partial<AnalyticsEvent> & Pick<AnalyticsEvent, 'tenant_id' | 'event_type'>; Update: Partial<AnalyticsEvent>; Relationships: never[] };
      ai_interactions: { Row: AiInteraction; Insert: Partial<AiInteraction> & Pick<AiInteraction, 'agent' | 'model'>; Update: Partial<AiInteraction>; Relationships: never[] };
      stripe_events: { Row: StripeEvent; Insert: Partial<StripeEvent> & Pick<StripeEvent, 'id' | 'type' | 'data'>; Update: Partial<StripeEvent>; Relationships: never[] };
    };
    Views: Record<string, {
      Row: Record<string, unknown>;
      Relationships: never[];
    }>;
    Functions: {
      resolve_tenant: {
        Args: { p_slug: string | null; p_domain: string | null };
        Returns: TenantConfig;
      };
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      subscription_status: SubscriptionStatus;
      user_role: UserRole;
      tournament_format: TournamentFormat;
      tournament_status: TournamentStatus;
      match_status: MatchStatus;
      registration_status: RegistrationStatus;
      payment_status: PaymentStatus;
      order_status: OrderStatus;
      message_channel: MessageChannel;
      message_direction: MessageDirection;
      notification_type: NotificationType;
      court_type: CourtType;
      court_surface: CourtSurface;
      player_level: PlayerLevel;
      gender_type: GenderType;
    };
  };
}
