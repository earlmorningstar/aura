/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 *
 * Critical fixes from original:
 * 1. File renamed routes.ts → route.ts (Next.js App Router requirement)
 * 2. stripe.webhooks.constructEvent wrapped in try/catch — invalid
 *    signatures now return 400 instead of 500 (Stripe stops retrying)
 * 3. Fixed supabase import — original imported a non-existent `supabase`
 *    singleton; server.ts exports createClient(), not a singleton
 * 4. Added checkout.session.completed metadata guard
 * 5. Added customer.subscription.deleted handler (cancellations)
 * 6. Added customer.subscription.updated handler (plan changes)
 * 7. Request body must be read as raw text for signature verification —
 *    do NOT use req.json() which would consume and re-encode the body
 */

import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

/* ─── Helper to get Stripe instance safely ───────────────────────── */
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}

/* ─── Webhook secret ─────────────────────────────────────────────── */
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/* ─── Route handler ──────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  /* ── 1. Read raw body and signature ─────────────────────────────── */
  const payload   = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  /* ── 2. Verify webhook signature ───────────────────────────────── */
  let event: Stripe.Event;
  try {
    const stripe = getStripe(); // created only when needed
    event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn("[stripe/webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  /* ── 3. Handle events ────────────────────────────────────────────── */
  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId  = session.metadata?.user_id;

        if (!userId) {
          console.warn("[stripe/webhook] checkout.session.completed missing user_id metadata");
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status:     "pro",
            stripe_customer_id:      session.customer as string | null,
            stripe_subscription_id:  session.subscription as string | null,
            updated_at:              new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("[stripe/webhook] Failed to update profile after checkout:", error.message);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId   = subscription.customer as string;

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status:    "free",
            stripe_subscription_id: null,
            updated_at:             new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("[stripe/webhook] Failed to downgrade profile after cancellation:", error.message);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId   = subscription.customer as string;
        const status       = subscription.status;

        const profileStatus =
          status === "active" || status === "trialing" ? "pro" : "free";

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: profileStatus,
            updated_at:          new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("[stripe/webhook] Failed to update profile after subscription update:", error.message);
        }
        break;
      }

      default: {
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/webhook] Handler error:", message);
    return NextResponse.json(
      { error: "Internal handler error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
