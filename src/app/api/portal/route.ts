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

        // Get profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, email")
            .eq("id", user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        // If no customer ID saved, try to find the customer by email
        if (!customerId && user.email) {
            const customers = await stripe.customers.list({
                email: user.email,
                limit: 1,
            });

            if (customers.data.length > 0) {
                const firstCustomer = customers.data[0];
                if (firstCustomer) {
                    customerId = firstCustomer.id;

                    await supabase
                        .from("profiles")
                        .update({ stripe_customer_id: customerId })
                        .eq("id", user.id);
                }
            }
        }

        if (!customerId) {
            return NextResponse.json(
                { error: "No Stripe customer found. Please contact support." },
                { status: 400 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${baseUrl}/dashboard`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("[portal] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}