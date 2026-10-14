-- Migration 004: Security hardening
-- Fixes: search_path on all SECURITY DEFINER functions, role injection,
-- audit log access, data leakage, race conditions, offer expiry checks

-- ============================================================
-- CRITICAL: Fix handle_new_user role injection
-- Previously read role from user-supplied metadata, allowing any user
-- to self-assign platform_admin during signup
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- FIX: Add search_path to all SECURITY DEFINER helpers from 001
-- ============================================================

create or replace function is_platform_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'platform_admin'
  );
$$ language sql security definer stable set search_path = public;

create or replace function user_organisation_ids()
returns setof uuid as $$
  select organisation_id from dealer_memberships where user_id = auth.uid();
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- FIX: get_submission_by_token — return only customer-facing columns
-- Previously returned full row including dealer_notes, dealer_valuation
-- ============================================================

drop function if exists get_submission_by_token(text);

create or replace function get_submission_by_token(p_token text)
returns table (
  id uuid,
  reference text,
  organisation_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  description text,
  tcg_categories text[],
  estimated_card_count integer,
  estimated_value text,
  customer_notes text,
  status submission_status,
  agreed_to_terms boolean,
  created_at timestamptz,
  updated_at timestamptz
) as $$
  select
    cs.id, cs.reference, cs.organisation_id,
    cs.customer_name, cs.customer_email, cs.customer_phone,
    cs.description, cs.tcg_categories, cs.estimated_card_count,
    cs.estimated_value, cs.customer_notes, cs.status,
    cs.agreed_to_terms, cs.created_at, cs.updated_at
  from customer_submissions cs
  where cs.access_token = p_token
  limit 1;
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- FIX: get_offers_by_token — return only customer-facing columns
-- Previously returned full row including internal_notes, breakdown
-- ============================================================

drop function if exists get_offers_by_token(text, offer_status);

create or replace function get_offers_by_token(p_token text, p_status offer_status default null)
returns table (
  id uuid,
  submission_id uuid,
  amount decimal(10,2),
  currency text,
  dealer_message text,
  status offer_status,
  revision_number integer,
  sent_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz
) as $$
  select
    o.id, o.submission_id,
    o.amount, o.currency, o.dealer_message, o.status,
    o.revision_number, o.sent_at, o.expires_at, o.created_at
  from offers o
  inner join customer_submissions cs on cs.id = o.submission_id
  where cs.access_token = p_token
  and (p_status is null or o.status = p_status)
  order by o.created_at desc;
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- FIX: respond_to_offer — add expiry check + search_path
-- ============================================================

create or replace function respond_to_offer(
  p_token text,
  p_offer_id uuid,
  p_accept boolean,
  p_notes text default null
)
returns void as $$
declare
  v_submission_id uuid;
  v_expires_at timestamptz;
begin
  select cs.id, o.expires_at into v_submission_id, v_expires_at
  from customer_submissions cs
  inner join offers o on o.submission_id = cs.id
  where cs.access_token = p_token and o.id = p_offer_id and o.status = 'sent';

  if v_submission_id is null then
    raise exception 'Invalid token or offer not found';
  end if;

  if v_expires_at is not null and v_expires_at < now() then
    update offers set status = 'expired' where id = p_offer_id;
    raise exception 'This offer has expired';
  end if;

  update offers set
    status = case when p_accept then 'accepted'::offer_status else 'declined'::offer_status end,
    customer_response_at = now(),
    customer_response_notes = left(p_notes, 2000)
  where id = p_offer_id;

  update customer_submissions set
    status = case when p_accept then 'offer_accepted'::submission_status else 'offer_declined'::submission_status end
  where id = v_submission_id;

  insert into submission_status_history (submission_id, old_status, new_status, notes)
  select id,
    'offer_sent'::submission_status,
    case when p_accept then 'offer_accepted'::submission_status else 'offer_declined'::submission_status end,
    case when p_accept then 'Customer accepted offer' else 'Customer declined offer' end
  from customer_submissions where id = v_submission_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- FIX: log_audit — revoke public access, only callable by other
-- SECURITY DEFINER functions (approve_dealer_application, bootstrap_admin)
-- ============================================================

create or replace function log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'
)
returns void as $$
begin
  insert into audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), left(p_action, 200), left(p_entity_type, 200), p_entity_id, p_metadata);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function log_audit(text, text, uuid, jsonb) from public;
revoke execute on function log_audit(text, text, uuid, jsonb) from anon;
revoke execute on function log_audit(text, text, uuid, jsonb) from authenticated;

-- ============================================================
-- FIX: approve_dealer_application — use auth.uid() instead of
-- trusting client-supplied p_admin_id + add search_path
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
  v_actual_admin_id uuid;
begin
  v_actual_admin_id := auth.uid();

  if not is_platform_admin() then
    raise exception 'Only platform admins can approve applications';
  end if;

  select * into v_app from dealer_applications where id = p_application_id;
  if v_app is null then
    raise exception 'Application not found';
  end if;
  if v_app.status not in ('submitted', 'under_review', 'info_requested') then
    raise exception 'Application cannot be approved in current status: %', v_app.status;
  end if;

  v_slug_base := lower(regexp_replace(v_app.business_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug_base := trim(both '-' from v_slug_base);
  if v_slug_base = '' then v_slug_base := 'dealer'; end if;
  v_slug := v_slug_base;

  while exists (select 1 from dealer_organisations where slug = v_slug) loop
    v_slug_suffix := v_slug_suffix + 1;
    v_slug := v_slug_base || '-' || v_slug_suffix;
  end loop;

  insert into dealer_organisations (
    application_id, name, slug, status,
    contact_email, contact_phone,
    supported_tcg_categories,
    approved_by, approved_at
  ) values (
    p_application_id, v_app.business_name, v_slug, 'active',
    v_app.email, v_app.phone,
    v_app.tcg_categories,
    v_actual_admin_id, now()
  ) returning id into v_org_id;

  update dealer_applications set
    status = 'approved',
    reviewed_by = v_actual_admin_id,
    reviewed_at = now()
  where id = p_application_id;

  insert into application_status_history (application_id, old_status, new_status, changed_by, notes)
  values (p_application_id, v_app.status, 'approved', v_actual_admin_id, 'Application approved');

  if v_app.user_id is not null then
    insert into dealer_memberships (user_id, organisation_id, role, accepted_at)
    values (v_app.user_id, v_org_id, 'owner', now());

    update profiles set role = 'dealer_owner' where id = v_app.user_id;
  end if;

  perform log_audit('application_approved', 'dealer_applications', p_application_id,
    jsonb_build_object('org_id', v_org_id, 'business_name', v_app.business_name));

  return v_org_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- FIX: bootstrap_admin — add advisory lock to prevent race condition
-- ============================================================

create or replace function bootstrap_admin()
returns boolean as $$
declare
  v_admin_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('bootstrap_admin'));

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
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- FIX: Add search_path to trigger functions from 002
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
$$ language plpgsql security definer set search_path = public;

create or replace function track_submission_status()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into submission_status_history (submission_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- FIX: Add search_path to trigger functions from 003
-- ============================================================

create or replace function notify_application_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into notifications (email_to, type, subject, body, metadata)
    values (
      new.email,
      'application_status_changed',
      case new.status
        when 'under_review' then 'Your TCGBuyer application is under review'
        when 'info_requested' then 'Additional information requested for your application'
        when 'approved' then 'Your TCGBuyer dealer application has been approved!'
        when 'rejected' then 'Update on your TCGBuyer application'
        else 'Application status update'
      end,
      case new.status
        when 'approved' then 'Congratulations! Your dealer application (' || new.reference || ') has been approved. You can now sign in to access your dealer dashboard.'
        when 'rejected' then 'We have reviewed your application (' || new.reference || '). Unfortunately, we are unable to approve it at this time.' ||
          case when new.rejection_reason_applicant is not null then ' Reason: ' || new.rejection_reason_applicant else '' end
        when 'info_requested' then 'We need additional information regarding your application (' || new.reference || ').' ||
          case when new.info_request_message is not null then ' Details: ' || new.info_request_message else '' end
        when 'under_review' then 'Your application (' || new.reference || ') is now being reviewed. We will be in touch soon.'
        else 'Your application (' || new.reference || ') status has been updated to: ' || new.status
      end,
      jsonb_build_object('application_id', new.id, 'reference', new.reference, 'new_status', new.status)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function notify_new_submission()
returns trigger as $$
declare
  v_org_email text;
begin
  select contact_email into v_org_email
  from dealer_organisations where id = new.organisation_id;

  if v_org_email is not null then
    insert into notifications (email_to, type, subject, body, metadata)
    values (
      v_org_email,
      'new_submission',
      'New collection submission received (' || new.reference || ')',
      'A new collection has been submitted by ' || new.customer_name || ' (' || new.customer_email || '). ' ||
        'Sign in to your dealer dashboard to review it.',
      jsonb_build_object('submission_id', new.id, 'reference', new.reference, 'organisation_id', new.organisation_id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function notify_offer_sent()
returns trigger as $$
declare
  v_sub record;
begin
  if new.status = 'sent' and (old.status is distinct from 'sent') then
    select cs.*, do2.name as org_name into v_sub
    from customer_submissions cs
    join dealer_organisations do2 on do2.id = cs.organisation_id
    where cs.id = new.submission_id;

    if v_sub is not null then
      insert into notifications (email_to, type, subject, body, metadata)
      values (
        v_sub.customer_email,
        'offer_sent',
        'You have received an offer for your collection',
        v_sub.org_name || ' has sent you an offer of £' || new.amount::text || ' for your collection (' || v_sub.reference || '). ' ||
          'Visit your submission status page to review and respond.',
        jsonb_build_object('offer_id', new.id, 'submission_id', new.submission_id, 'amount', new.amount)
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- FIX: Add search_path to utility functions from 001
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

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
$$ language plpgsql set search_path = public;

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
$$ language plpgsql set search_path = public;
