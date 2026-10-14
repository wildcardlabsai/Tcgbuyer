-- Migration 003: Email notification queue and processing
-- Provides the database-side boundary for transactional email.
-- Actual email delivery requires a Supabase Edge Function or external service.

-- Insert notifications on key events using database triggers.
-- A separate process (Edge Function, cron, or webhook) reads unsent
-- notifications and delivers them via the configured email provider.

-- Trigger: notify on application status change
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
$$ language plpgsql security definer;

drop trigger if exists tr_notify_application_status on dealer_applications;
create trigger tr_notify_application_status
  after update of status on dealer_applications
  for each row execute function notify_application_status_change();

-- Trigger: notify dealer on new submission
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
$$ language plpgsql security definer;

drop trigger if exists tr_notify_new_submission on customer_submissions;
create trigger tr_notify_new_submission
  after insert on customer_submissions
  for each row execute function notify_new_submission();

-- Trigger: notify customer when offer is sent
create or replace function notify_offer_sent()
returns trigger as $$
declare
  v_sub record;
  v_org_name text;
begin
  if new.status = 'sent' and (old.status is distinct from 'sent') then
    select cs.*, do.name as org_name into v_sub
    from customer_submissions cs
    join dealer_organisations do on do.id = cs.organisation_id
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
$$ language plpgsql security definer;

drop trigger if exists tr_notify_offer_sent on offers;
create trigger tr_notify_offer_sent
  after update of status on offers
  for each row execute function notify_offer_sent();

-- ============================================================
-- EMAIL DELIVERY
-- ============================================================
-- To process the notification queue, deploy a Supabase Edge Function
-- or scheduled job that:
--   1. SELECT * FROM notifications WHERE sent_at IS NULL AND failed_at IS NULL ORDER BY created_at LIMIT 50
--   2. Send each via your email provider (Resend, SendGrid, Postmark, etc.)
--   3. UPDATE notifications SET sent_at = now() WHERE id = <id>
--   4. On failure: UPDATE notifications SET failed_at = now(), error = <message> WHERE id = <id>
--
-- Example Edge Function skeleton (deploy to supabase/functions/send-notifications):
--
--   import { createClient } from '@supabase/supabase-js';
--   import { Resend } from 'resend';
--
--   Deno.serve(async () => {
--     const supabase = createClient(
--       Deno.env.get('SUPABASE_URL')!,
--       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
--     );
--     const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
--
--     const { data: pending } = await supabase
--       .from('notifications')
--       .select('*')
--       .is('sent_at', null)
--       .is('failed_at', null)
--       .order('created_at')
--       .limit(50);
--
--     for (const n of pending ?? []) {
--       try {
--         await resend.emails.send({
--           from: 'noreply@tcgbuyer.app',
--           to: n.email_to,
--           subject: n.subject,
--           text: n.body,
--         });
--         await supabase.from('notifications').update({ sent_at: new Date().toISOString() }).eq('id', n.id);
--       } catch (err) {
--         await supabase.from('notifications').update({ failed_at: new Date().toISOString(), error: String(err) }).eq('id', n.id);
--       }
--     }
--     return new Response('OK');
--   });
--
-- Configure a pg_cron job or Supabase cron to invoke this function periodically.
