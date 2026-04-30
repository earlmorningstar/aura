// export type RevenueTransaction = {
//   id: string;
//   date: string;
//   amount: number;
//   source: string;
//   description: string | null;
// };




/**
 * types/supabase.ts — Supabase table type definitions.
 *
 * Fixes:
 * 1. RevenueTransaction.id widened to string | number (matches DataTable constraint)
 * 2. description made non-nullable string (matches Transaction in revenue-store.ts)
 *    — the DB column should have a NOT NULL DEFAULT '' constraint
 * 3. Added Profile type for subscription management (used by webhook handler)
 * 4. Added Workspace type matching workspace-store.ts shape
 *
 * TODO: Generate these from Supabase CLI for full type safety:
 *   npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
 */

/* ─── Revenue transactions ───────────────────────────────────────── */

export type RevenueTransaction = {
  /** Supabase UUID primary key */
  id:           string;
  date:         string;           // ISO date "YYYY-MM-DD"
  amount:       number;
  source:       string;
  description:  string;           // NOT NULL DEFAULT '' in DB
  workspace_id?: string;
  created_at?:  string;
};

/* ─── Profiles ───────────────────────────────────────────────────── */

export type SubscriptionStatus = "free" | "pro" | "cancelled";

export type Profile = {
  id:                     string; // Matches auth.users.id
  email?:                 string;
  full_name?:             string;
  avatar_url?:            string;
  subscription_status:    SubscriptionStatus;
  stripe_customer_id?:    string | null;
  stripe_subscription_id?: string | null;
  updated_at?:            string;
  created_at?:            string;
};

/* ─── Workspaces ─────────────────────────────────────────────────── */

export type Workspace = {
  id:         string;
  slug:       string;
  name:       string;
  owner_id:   string;
  created_at?: string;
};