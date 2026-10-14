-- Migration 002: Fix RLS policies, add approval workflow, fix audit_log conflicts
-- Addresses critical security and workflow issues from audit

-- ============================================================
-- FIX: customer_submissions RLS - "Customers can view own via token"
-- was using (true) which exposes ALL submissions to any user
-- Replace with a policy that only allows viewing by access_token
-- ============================================================

drop policy if exists "Customers can view own via token" on customer_submissions;

create policy "Customers can view own via token" on customer_submissions
  for select
  using (
    access_token = current_setting('request.headers', true)::json->>'x-access-token'
    or access_token = coalesce(
      current_setting('app.current_access_token', true),
      ''
    )
  );

-- Since the customer portal uses the anon key without auth headers,
-- we need a function to fetch submissions by token securely
create or replace function get_submission_by_token(p_token text)
returns setof customer_submissions as $$
  select * from customer_submissions where access_token = p_token limit 1;
$$ language sql security definer stable;

-- Function to get offers for a submission (by token verification)
create or replace function get_offers_by_token(p_token text, p_status offer_status default null)
returns setof offers as $$
  select o.* from offers o
  inner join customer_submissions cs on cs.id = o.submission_id
  where cs.access_token = p_token
  and (p_status is null or o.status = p_status)
  order by o.created_at desc;
$$ language sql security definer stable;

-- Function for customers to respond to offers (by token verification)
create or replace function respond_to_offer(
  p_token text,
  p_offer_id uuid,
  p_accept boolean,
  p_notes text default null
)
returns void as $$
declare
  v_submission_id uuid;
begin
  select cs.id into v_submission_id
  from customer_submissions cs
  inner join offers o on o.submission_id = cs.id
  where cs.access_token = p_token and o.id = p_offer_id and o.status = 'sent';

  if v_submission_id is null then
    raise exception 'Invalid token or offer not found';
  end if;

  update offers set
    status = case when p_accept then 'accepted'::offer_status else 'declined'::offer_status end,
    customer_response_at = now(),
    customer_response_notes = p_notes
  where id = p_offer_id;

  update customer_submissions set
    status = case when p_accept then 'offer_accepted'::submission_status else 'offer_declined'::submission_status end
  where id = v_submission_id;

  insert into submission_status_history (submission_id, old_status, new_status, notes)
  select id,
    case when p_accept then 'offer_sent'::submission_status else 'offer_sent'::submission_status end,
    case when p_accept then 'offer_accepted'::submission_status else 'offer_declined'::submission_status end,
    case when p_accept then 'Customer accepted offer' else 'Customer declined offer' end
  from customer_submissions where id = v_submission_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- FIX: audit_log conflicting insert policies
-- Remove the overly permissive "System can insert audit log" policy
-- and keep only the admin policy + a SECURITY DEFINER function for logging
-- ============================================================

drop policy if exists "System can insert audit log" on audit_log;
drop policy if exists "Admins can insert audit log" on audit_log;

create or replace function log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'
)
returns void as $$
begin
  insert into audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$ language plpgsql security definer;

-- ============================================================
-- ADD: Application approval workflow
-- Creates dealer_organisation + dealer_membership + updates profile role
-- All in a single transaction via SECURITY DEFINER function
-- ============================================================

create or replace function approve_dealer_application(
  p_application_id uuid,
  p_admin_id uuid
)
returns uuid as $$
declare
  v_app dealer_applications%rowtype;
  v_org_id uuid;
  v_slug text;
  v_slug_base text;
  v_slug_suffix integer := 0;
begin
  -- Verify caller is platform admin
  if not is_platform_admin() then
    raise exception 'Only platform admins can approve applications';
  end if;

  -- Get the application
  select * into v_app from dealer_applications where id = p_application_id;
  if v_app is null then
    raise exception 'Application not found';
  end if;
  if v_app.status not in ('submitted', 'under_review', 'info_requested') then
    raise exception 'Application cannot be approved in current status: %', v_app.status;
  end if;

  -- Generate slug from business name
  v_slug_base := lower(regexp_replace(v_app.business_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug_base := trim(both '-' from v_slug_base);
  if v_slug_base = '' then v_slug_base := 'dealer'; end if;
  v_slug := v_slug_base;

  -- Ensure unique slug
  while exists (select 1 from dealer_organisations where slug = v_slug) loop
    v_slug_suffix := v_slug_suffix + 1;
    v_slug := v_slug_base || '-' || v_slug_suffix;
  end loop;

  -- Create dealer organisation
  insert into dealer_organisations (
    application_id, name, slug, status,
    contact_email, contact_phone,
    supported_tcg_categories,
    approved_by, approved_at
  ) values (
    p_application_id, v_app.business_name, v_slug, 'active',
    v_app.email, v_app.phone,
    v_app.tcg_categories,
    p_admin_id, now()
  ) returning id into v_org_id;

  -- Update application status
  update dealer_applications set
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = now()
  where id = p_application_id;

  -- Record status history
  insert into application_status_history (application_id, old_status, new_status, changed_by, notes)
  values (p_application_id, v_app.status, 'approved', p_admin_id, 'Application approved');

  -- If applicant has a user account, set up membership and update role
  if v_app.user_id is not null then
    insert into dealer_memberships (user_id, organisation_id, role, accepted_at)
    values (v_app.user_id, v_org_id, 'owner', now());

    update profiles set role = 'dealer_owner' where id = v_app.user_id;
  end if;

  -- Log in audit
  perform log_audit('application_approved', 'dealer_applications', p_application_id,
    jsonb_build_object('org_id', v_org_id, 'business_name', v_app.business_name));

  return v_org_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ADD: Status history tracking functions
-- ============================================================

create or replace function track_application_status()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into application_status_history (application_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_application_status_history on dealer_applications;
create trigger tr_application_status_history
  after update of status on dealer_applications
  for each row execute function track_application_status();

create or replace function track_submission_status()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into submission_status_history (submission_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_submission_status_history on customer_submissions;
create trigger tr_submission_status_history
  after update of status on customer_submissions
  for each row execute function track_submission_status();

-- ============================================================
-- ADD: Supabase Storage bucket for submission photos
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-photos',
  'submission-photos',
  false,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Storage policies: dealers can view their org's photos, anyone can upload during submission
create policy "Org members can view photos"
  on storage.objects for select
  using (
    bucket_id = 'submission-photos'
    and (
      (storage.foldername(name))[1] in (
        select id::text from dealer_organisations
        where id in (select user_organisation_ids())
      )
      or is_platform_admin()
    )
  );

create policy "Anyone can upload submission photos"
  on storage.objects for insert
  with check (
    bucket_id = 'submission-photos'
    and (octet_length(name) < 500)
  );

-- ============================================================
-- ADD: Admin bootstrap function
-- First user to call this becomes platform_admin if no admins exist
-- ============================================================

create or replace function bootstrap_admin()
returns boolean as $$
declare
  v_admin_count integer;
begin
  select count(*) into v_admin_count from profiles where role = 'platform_admin';
  if v_admin_count > 0 then
    raise exception 'Platform already has administrators. Use admin panel to manage roles.';
  end if;

  update profiles set role = 'platform_admin' where id = auth.uid();
  if not found then
    raise exception 'No profile found for current user. Sign up first.';
  end if;

  perform log_audit('admin_bootstrap', 'profiles', auth.uid(),
    jsonb_build_object('action', 'First admin bootstrap'));

  return true;
end;
$$ language plpgsql security definer;
