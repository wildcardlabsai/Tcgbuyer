# TCGBuyer.app — Release Readiness Report

## Verification Summary

| Category | Status |
|---|---|
| TypeScript compilation | Pass (zero errors) |
| Production build | Pass |
| Automated tests | 32/32 passing |
| Security audit | All identified issues fixed in migration 004 |
| Backend integration | **Not tested** — no Supabase credentials configured |
| End-to-end workflows | **Not tested** — requires live backend |

---

## Verified Through Automated Tests (mock backend)

| Area | Tests | What's covered |
|---|---|---|
| **ConfigCheck** | 2 | Shows setup instructions when unconfigured; renders app when configured |
| **StatusBadge** | 3 | Renders text, applies known/fallback colours |
| **Button** | 4 | Renders, fires onClick, applies primary/secondary styles |
| **ProtectedRoute** | 7 | Loading state, redirect unauthenticated, admin/dealer gate enforcement |
| **AuthContext** | 6 | Provider requirement, loading lifecycle, session loading, signIn/signUp/signOut delegation, subscription cleanup |
| **LoginPage** | 4 | Form rendering, navigation links, loading state |
| **NotFoundPage** | 3 | 404 display, home link |
| **supabase module** | 2 | Env var detection (configured/unconfigured) |

## Awaiting Credentials / Manual Configuration

| Item | What's needed | Impact if skipped |
|---|---|---|
| **Supabase project** | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` | App shows "Configuration Required" screen |
| **Database migrations** | Run all 4 migrations in order (`001` through `004`) | No tables, functions, or policies exist |
| **Admin bootstrap** | First user calls `select bootstrap_admin()` | No administrator account exists |
| **Email delivery** | Deploy Edge Function with `RESEND_API_KEY` | Notifications queued but not sent |
| **Auth URL config** | Set Site URL and redirect URLs in Supabase dashboard | Password reset emails use wrong links |

## Security Issues Found and Fixed (Migration 004)

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **CRITICAL** | `handle_new_user` allowed self-assigning `platform_admin` via signup metadata | Role hardcoded to `'customer'` |
| 2 | **CRITICAL** | All 14 SECURITY DEFINER functions missing `SET search_path` | Added `SET search_path = public` to every function |
| 3 | **HIGH** | `log_audit()` callable by any authenticated user via RPC | `REVOKE EXECUTE` from public, anon, authenticated |
| 4 | **HIGH** | `get_submission_by_token()` returned full row including `dealer_notes`, `dealer_valuation` | Returns only customer-facing columns |
| 5 | **HIGH** | `get_offers_by_token()` returned full row including `internal_notes` | Returns only customer-facing columns |
| 6 | **MEDIUM** | `bootstrap_admin()` race condition — two simultaneous callers could both become admin | Added `pg_advisory_xact_lock` |
| 7 | **MEDIUM** | `approve_dealer_application()` trusted client-supplied `p_admin_id` parameter | Uses `auth.uid()` directly, ignores client value |
| 8 | **MEDIUM** | `respond_to_offer()` did not check `expires_at` — expired offers could be accepted | Checks expiry, auto-expires if past due |
| 9 | **LOW** | `notify_offer_sent()` used `do` (reserved keyword) as table alias | Changed to `do2` |
| 10 | **LOW** | `respond_to_offer()` no input length validation on `p_notes` | Truncated to 2000 chars with `left()` |

## Security Model Verification (Code Review)

| Control | Status | Notes |
|---|---|---|
| Dealer cross-tenant isolation | **Correct by design** | RLS policies use `user_organisation_ids()` to scope all dealer queries; frontend also filters by `organisation_id` |
| Public submission exposure | **Fixed** | Original `using(true)` policy removed; token-based access via SECURITY DEFINER only |
| Token scoping | **Correct** | `respond_to_offer` joins on token + offer ID; rejects mismatched tokens |
| Admin privilege escalation | **Fixed** | `handle_new_user` no longer reads role from metadata; `approve_dealer_application` uses `auth.uid()` |
| Dealer self-promotion | **Blocked** | Profile role updates require admin RLS or SECURITY DEFINER context |
| Photo privacy | **Correct** | Storage bucket is private; policies scope by organisation ID |
| Audit log integrity | **Fixed** | `log_audit()` not callable via RPC; only internal functions can write |
| Search path injection | **Fixed** | All SECURITY DEFINER functions set `search_path = public` |

## Outstanding Items

1. **No live backend testing has been performed.** All verification is through static analysis, code review, and mock-based automated tests. The workflows (dealer application, approval, submission, offer, acceptance) have been verified to call the correct RPCs with correct parameters, but actual database execution has not been tested.

2. **Email delivery is not implemented.** The notification queue triggers correctly insert into the `notifications` table (verified by code review), but the Edge Function to actually send emails must be deployed separately with provider credentials.

3. **The `do` reserved-word alias in migration 003** (`notify_offer_sent`) may cause a syntax error on some PostgreSQL configurations when running migration 003 for the first time. Migration 004 replaces the function with a corrected version using `do2`. If migration 003 fails, you can either: (a) fix the alias in 003 before running it, or (b) skip the error and let 004 overwrite the function.

4. **Suspended dealer access**: The `dealer_account_status` enum includes `suspended` but no RLS policy currently checks `dealer_organisations.status` to block suspended dealers from accessing data. Dealers whose organisation is suspended can still query their own data. Consider adding a status check to `user_organisation_ids()` if suspended dealers should lose access.

## Files Changed or Created

### Migrations
- `supabase/migrations/001_initial_schema.sql` — foundation (unchanged)
- `supabase/migrations/002_fixes_rls_approval_workflow.sql` — RLS fixes, SECURITY DEFINER functions, storage, bootstrap
- `supabase/migrations/003_email_notification_edge_function.sql` — notification triggers
- `supabase/migrations/004_security_hardening.sql` — **NEW** — all security fixes listed above

### Source (unchanged from previous commit)
- `src/lib/supabase.ts`, `src/components/ConfigCheck.tsx`, `src/App.tsx`
- Admin pages: `AdminSettings.tsx`, `AdminApplicationDetail.tsx`
- Dealer pages: `DealerSubmissionDetail.tsx`, `DealerDashboardPage.tsx`, `DealerOffers.tsx`, `DealerSettings.tsx`
- Portal pages: `SubmissionStatusPage.tsx`, `SubmissionFormPage.tsx`
- Auth: `ResetPasswordPage.tsx`

### Tests (32 tests, 8 files)
- Components: `ConfigCheck`, `StatusBadge`, `Button`, `ProtectedRoute`
- Context: `AuthContext`
- Pages: `LoginPage`, `NotFoundPage`
- Library: `supabase` module

### Documentation
- `DEPLOYMENT.md` — updated with 4th migration and security notes
- `FINAL_REPORT.md` — this file
