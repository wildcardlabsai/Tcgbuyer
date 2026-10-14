# TCGBuyer.app — Deployment Guide

## Prerequisites

- Node.js 20+
- A Supabase project (free tier works for development)
- (Optional) An email provider account (Resend, SendGrid, or Postmark) for transactional emails

## 1. Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are found in your Supabase project dashboard under Settings > API.

The **service role key** is never exposed to the client. It is used only in Supabase Edge Functions. Set it as an environment variable in your Edge Function configuration, never in `.env`.

## 2. Database Setup

Run the migrations in order against your Supabase database:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually via the SQL Editor in Supabase Dashboard:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_fixes_rls_approval_workflow.sql
# 3. supabase/migrations/003_email_notification_edge_function.sql
```

### What the migrations create

- **001**: All tables, enums, triggers, RLS policies, seed data
- **002**: Security fixes (RLS for customer_submissions, audit_log), application approval workflow (server-side function), status history tracking triggers, Supabase Storage bucket for photos, admin bootstrap function
- **003**: Email notification queue triggers (application status, new submissions, offer sent)

## 3. First Administrator Bootstrap

There is **no default admin account** with a hardcoded password. Instead:

1. Sign up for an account at `/signup`
2. Confirm your email
3. Sign in at `/login`
4. Call the bootstrap function from the Supabase SQL Editor or via the client:

```sql
-- In Supabase SQL Editor (run as the user's session, not service role):
select bootstrap_admin();
```

Or from your browser console while signed in:

```javascript
const { data, error } = await supabase.rpc('bootstrap_admin');
console.log(data, error);
```

This function:
- Checks that no platform_admin exists yet
- Promotes the currently authenticated user to platform_admin
- Logs the action in the audit log
- Fails if any admin already exists (use the admin panel for subsequent admin assignments)

## 4. Build & Deploy

```bash
npm install
npm run build
```

The `dist/` directory contains the production build. Deploy to any static host:

- **Vercel**: Connect repo, set environment variables, deploy
- **Netlify**: Same workflow, add `_redirects` file with `/* /index.html 200`
- **Cloudflare Pages**: Connect repo, set build command to `npm run build`, output to `dist`

For SPA routing, configure your host to serve `index.html` for all paths.

## 5. Supabase Auth Configuration

In your Supabase dashboard under Authentication > URL Configuration:

- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: `https://your-domain.com/reset-password`

Under Authentication > Email Templates, customise the confirmation and password reset emails.

## 6. Email Notifications (Optional)

The notification queue is database-driven. Emails are queued in the `notifications` table by database triggers. To deliver them:

1. Sign up for Resend (or another provider)
2. Deploy the Edge Function skeleton from `003_email_notification_edge_function.sql`
3. Set `RESEND_API_KEY` as an Edge Function secret
4. Configure a cron or pg_cron to invoke the function every 1-5 minutes

Without this step, notifications are queued but not delivered. All other functionality works.

## 7. Storage (Photo Uploads)

Migration 002 creates the `submission-photos` storage bucket automatically. Verify in your Supabase dashboard under Storage that the bucket exists with:

- **Public**: No (private)
- **Size limit**: 10MB
- **Allowed types**: image/jpeg, image/png, image/webp, image/heic

## Architecture Notes

### Security Model

- **Row Level Security (RLS)** enforces data isolation at the database level
- Admin operations that require privilege escalation use `SECURITY DEFINER` functions (`approve_dealer_application`, `bootstrap_admin`, `log_audit`)
- Customer submission viewing uses token-based access via `get_submission_by_token` (SECURITY DEFINER) — tokens are never exposed through RLS
- Offer responses go through `respond_to_offer` which verifies the token before allowing changes
- Client-side route guards (`ProtectedRoute`) provide UX convenience but are **not** the security boundary

### Multi-tenancy

All dealer data is scoped by `organisation_id`. RLS policies use `user_organisation_ids()` to enforce this at the database level.

### Currency

The platform defaults to GBP (£). The `offers.currency` column defaults to `'GBP'` and the UI displays £.
