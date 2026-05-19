import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { priceId } = (await req.json()) as { priceId: string };
        if (!priceId) {
            return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
            customer_email: user.email,
            metadata: { user_id: user.id },
            subscription_data: { metadata: { user_id: user.id } },
            allow_promotion_codes: true,
            billing_address_collection: "required",
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("[checkout] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}