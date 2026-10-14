-- TCGBuyer Platform Schema
-- Multi-tenant SaaS for TCG dealer collection buying

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('customer', 'dealer_staff', 'dealer_manager', 'dealer_owner', 'platform_admin');
create type application_status as enum ('draft', 'submitted', 'under_review', 'info_requested', 'approved', 'rejected', 'withdrawn');
create type dealer_account_status as enum ('onboarding', 'active', 'suspended', 'closed');
create type submission_status as enum ('submitted', 'under_review', 'awaiting_info', 'offer_prepared', 'offer_sent', 'offer_accepted', 'offer_declined', 'purchase_arranging', 'completed', 'cancelled');
create type offer_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired', 'revised');
create type staff_role as enum ('owner', 'manager', 'staff');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- DEALER APPLICATIONS
-- ============================================================

create table dealer_applications (
  id uuid primary key default uuid_generate_v4(),
  reference text unique not null,
  user_id uuid references profiles(id),

  -- Business info
  business_name text not null,
  applicant_name text not null,
  email text not null,
  phone text,
  country text not null default 'United Kingdom',
  business_address text,
  website_url text,
  social_links jsonb default '{}',

  -- Business details
  business_type text not null,
  tcg_categories text[] not null default '{}',
  has_physical_shop boolean default false,
  has_online_shop boolean default false,
  estimated_monthly_purchases text,
  business_description text,

  -- Status
  status application_status not null default 'submitted',

  -- Review
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  internal_notes text,
  applicant_message text,
  rejection_reason_internal text,
  rejection_reason_applicant text,
  info_request_message text,
  additional_info_response text,

  -- Terms
  agreed_to_terms boolean not null default false,
  agreed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_dealer_applications_status on dealer_applications(status);
create index idx_dealer_applications_email on dealer_applications(email);
create index idx_dealer_applications_user on dealer_applications(user_id);

-- ============================================================
-- APPLICATION STATUS HISTORY
-- ============================================================

create table application_status_history (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references dealer_applications(id) on delete cascade,
  old_status application_status,
  new_status application_status not null,
  changed_by uuid references profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DEALER ORGANISATIONS
-- ============================================================

create table dealer_organisations (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references dealer_applications(id),

  name text not null,
  slug text unique not null,
  status dealer_account_status not null default 'onboarding',

  -- Portal branding
  portal_headline text,
  portal_description text,
  portal_logo_url text,
  portal_primary_color text default '#2563eb',
  portal_accent_color text default '#7c3aed',
  contact_email text,
  contact_phone text,

  -- Configuration
  supported_tcg_categories text[] not null default '{"Pokémon", "Magic: The Gathering", "Yu-Gi-Oh!", "Other"}',
  submission_instructions text,
  purchasing_info text,
  customer_terms text,

  -- Metadata
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  suspended_at timestamptz,
  suspended_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_dealer_organisations_slug on dealer_organisations(slug);
create index idx_dealer_organisations_status on dealer_organisations(status);

-- ============================================================
-- DEALER MEMBERSHIPS (staff)
-- ============================================================

create table dealer_memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  organisation_id uuid not null references dealer_organisations(id) on delete cascade,
  role staff_role not null default 'staff',
  invited_by uuid references profiles(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, organisation_id)
);

-- ============================================================
-- CUSTOMER SUBMISSIONS
-- ============================================================

create table customer_submissions (
  id uuid primary key default uuid_generate_v4(),
  reference text unique not null,
  organisation_id uuid not null references dealer_organisations(id),

  -- Customer info
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  access_token text unique not null default encode(gen_random_bytes(32), 'hex'),

  -- Collection
  description text,
  tcg_categories text[] not null default '{}',
  estimated_card_count integer,
  estimated_value text,
  customer_notes text,

  -- Status
  status submission_status not null default 'submitted',

  -- Dealer notes (never shown to customer)
  dealer_notes text,
  dealer_valuation text,

  -- Agreed terms
  agreed_to_terms boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_submissions_org on customer_submissions(organisation_id);
create index idx_submissions_status on customer_submissions(status);
create index idx_submissions_token on customer_submissions(access_token);
create index idx_submissions_email on customer_submissions(customer_email);

-- ============================================================
-- SUBMISSION PHOTOS
-- ============================================================

create table submission_photos (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references customer_submissions(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size integer,
  mime_type text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SUBMISSION STATUS HISTORY
-- ============================================================

create table submission_status_history (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references customer_submissions(id) on delete cascade,
  old_status submission_status,
  new_status submission_status not null,
  changed_by uuid references profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- OFFERS
-- ============================================================

create table offers (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references customer_submissions(id) on delete cascade,
  organisation_id uuid not null references dealer_organisations(id),

  amount decimal(10,2) not null,
  currency text not null default 'GBP',
  breakdown jsonb,

  dealer_message text,
  internal_notes text,

  status offer_status not null default 'draft',

  -- Revision tracking
  revision_number integer not null default 1,
  previous_offer_id uuid references offers(id),

  -- Response
  customer_response_at timestamptz,
  customer_response_notes text,

  created_by uuid references profiles(id),
  sent_at timestamptz,
  expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_offers_submission on offers(submission_id);
create index idx_offers_org on offers(organisation_id);

-- ============================================================
-- AUDIT LOG
-- ============================================================

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz not null default now()
);

create index idx_audit_log_actor on audit_log(actor_id);
create index idx_audit_log_entity on audit_log(entity_type, entity_id);
create index idx_audit_log_created on audit_log(created_at desc);

-- ============================================================
-- PLATFORM SETTINGS
-- ============================================================

create table platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  email_to text,
  type text not null,
  subject text not null,
  body text not null,
  metadata jsonb default '{}',
  sent_at timestamptz,
  failed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger tr_profiles_updated before update on profiles for each row execute function update_updated_at();
create trigger tr_applications_updated before update on dealer_applications for each row execute function update_updated_at();
create trigger tr_organisations_updated before update on dealer_organisations for each row execute function update_updated_at();
create trigger tr_memberships_updated before update on dealer_memberships for each row execute function update_updated_at();
create trigger tr_submissions_updated before update on customer_submissions for each row execute function update_updated_at();
create trigger tr_offers_updated before update on offers for each row execute function update_updated_at();

-- Generate application reference
create or replace function generate_application_reference()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(substring(reference from 'APP-(\d+)')::integer), 0) + 1
  into next_num
  from dealer_applications;

  new.reference = 'APP-' || lpad(next_num::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create trigger tr_application_reference
  before insert on dealer_applications
  for each row
  when (new.reference is null or new.reference = '')
  execute function generate_application_reference();

-- Generate submission reference
create or replace function generate_submission_reference()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(substring(reference from 'TCG-(\d+)')::integer), 0) + 1
  into next_num
  from customer_submissions;

  new.reference = 'TCG-' || lpad(next_num::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create trigger tr_submission_reference
  before insert on customer_submissions
  for each row
  when (new.reference is null or new.reference = '')
  execute function generate_submission_reference();

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table dealer_applications enable row level security;
alter table application_status_history enable row level security;
alter table dealer_organisations enable row level security;
alter table dealer_memberships enable row level security;
alter table customer_submissions enable row level security;
alter table submission_photos enable row level security;
alter table submission_status_history enable row level security;
alter table offers enable row level security;
alter table audit_log enable row level security;
alter table platform_settings enable row level security;
alter table notifications enable row level security;

-- Helper: check if user is platform admin
create or replace function is_platform_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'platform_admin'
  );
$$ language sql security definer stable;

-- Helper: check if user belongs to an organisation
create or replace function user_organisation_ids()
returns setof uuid as $$
  select organisation_id from dealer_memberships where user_id = auth.uid();
$$ language sql security definer stable;

-- PROFILES
create policy "Users can view own profile" on profiles for select using (id = auth.uid());
create policy "Users can update own profile" on profiles for update using (id = auth.uid());
create policy "Admins can view all profiles" on profiles for select using (is_platform_admin());
create policy "Admins can update all profiles" on profiles for update using (is_platform_admin());

-- DEALER APPLICATIONS
create policy "Users can view own applications" on dealer_applications for select using (user_id = auth.uid() or email = (select email from profiles where id = auth.uid()));
create policy "Users can insert applications" on dealer_applications for insert with check (true);
create policy "Users can update own draft applications" on dealer_applications for update using (user_id = auth.uid() and status in ('draft', 'info_requested'));
create policy "Admins can do anything with applications" on dealer_applications for all using (is_platform_admin());

-- APPLICATION STATUS HISTORY
create policy "Users can view own app history" on application_status_history for select using (
  application_id in (select id from dealer_applications where user_id = auth.uid())
);
create policy "Admins can manage app history" on application_status_history for all using (is_platform_admin());

-- DEALER ORGANISATIONS
create policy "Members can view own org" on dealer_organisations for select using (id in (select user_organisation_ids()));
create policy "Admins can manage orgs" on dealer_organisations for all using (is_platform_admin());
create policy "Public can view active orgs by slug" on dealer_organisations for select using (status = 'active');

-- DEALER MEMBERSHIPS
create policy "Members can view org memberships" on dealer_memberships for select using (
  organisation_id in (select user_organisation_ids())
);
create policy "Owners can manage memberships" on dealer_memberships for all using (
  organisation_id in (
    select organisation_id from dealer_memberships where user_id = auth.uid() and role = 'owner'
  )
);
create policy "Admins can manage memberships" on dealer_memberships for all using (is_platform_admin());

-- CUSTOMER SUBMISSIONS
create policy "Org members can view org submissions" on customer_submissions for select using (
  organisation_id in (select user_organisation_ids())
);
create policy "Org members can update org submissions" on customer_submissions for update using (
  organisation_id in (select user_organisation_ids())
);
create policy "Public can insert submissions" on customer_submissions for insert with check (true);
create policy "Customers can view own via token" on customer_submissions for select using (true);
create policy "Admins can manage submissions" on customer_submissions for all using (is_platform_admin());

-- SUBMISSION PHOTOS
create policy "Org members can view submission photos" on submission_photos for select using (
  submission_id in (select id from customer_submissions where organisation_id in (select user_organisation_ids()))
);
create policy "Public can insert photos" on submission_photos for insert with check (true);
create policy "Admins can manage photos" on submission_photos for all using (is_platform_admin());

-- SUBMISSION STATUS HISTORY
create policy "Org members can view submission history" on submission_status_history for select using (
  submission_id in (select id from customer_submissions where organisation_id in (select user_organisation_ids()))
);
create policy "Org members can insert history" on submission_status_history for insert with check (
  submission_id in (select id from customer_submissions where organisation_id in (select user_organisation_ids()))
);
create policy "Admins can manage submission history" on submission_status_history for all using (is_platform_admin());

-- OFFERS
create policy "Org members can view org offers" on offers for select using (
  organisation_id in (select user_organisation_ids())
);
create policy "Org members can manage org offers" on offers for all using (
  organisation_id in (select user_organisation_ids())
);
create policy "Admins can manage offers" on offers for all using (is_platform_admin());

-- AUDIT LOG
create policy "Admins can view audit log" on audit_log for select using (is_platform_admin());
create policy "Admins can insert audit log" on audit_log for insert with check (is_platform_admin());
create policy "System can insert audit log" on audit_log for insert with check (true);

-- PLATFORM SETTINGS
create policy "Admins can manage settings" on platform_settings for all using (is_platform_admin());
create policy "Anyone can read settings" on platform_settings for select using (true);

-- NOTIFICATIONS
create policy "Users can view own notifications" on notifications for select using (user_id = auth.uid());
create policy "Admins can manage notifications" on notifications for all using (is_platform_admin());

-- ============================================================
-- SEED: Default platform settings
-- ============================================================

insert into platform_settings (key, value) values
  ('supported_tcg_categories', '["Pokémon", "Magic: The Gathering", "Yu-Gi-Oh!", "Dragon Ball Super", "One Piece", "Flesh and Blood", "Lorcana", "Other"]'),
  ('business_types', '["Independent card shop", "Online retailer", "Market stall / fair trader", "Game café or club", "Established dealer / wholesaler", "Other"]'),
  ('application_review_required', 'true')
on conflict do nothing;
