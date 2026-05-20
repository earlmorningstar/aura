import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            // No Stripe customer yet – maybe webhook hasn't fired, or it's an old account.
            // We'll return a specific error so the UI can guide the user.
            return NextResponse.json(
                { error: "No Stripe customer found. Please contact support." },
                { status: 400 }
            );
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("[portal] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}