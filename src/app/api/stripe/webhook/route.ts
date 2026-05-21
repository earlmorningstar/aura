/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 */

import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        if (!userId) break;

        // Getting price ID from the first line item
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        const plan = priceId ? (PLANS[priceId] ?? "pro") : "pro";

        await supabase.from("profiles").upsert({
          id: userId,
          subscription_status: plan,
          plan,
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await supabase.from("profiles")
          .update({ subscription_status: "free", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? (PLANS[priceId] ?? "free") : "free";
        const status = subscription.status === "active" || subscription.status === "trialing" ? plan : "free";
        await supabase.from("profiles")
          .update({ subscription_status: status, plan, updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
