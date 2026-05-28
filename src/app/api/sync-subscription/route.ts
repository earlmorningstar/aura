import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { sessionId } = await req.json();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            const priceId = session.line_items?.data[0]?.price?.id;

            // Fallback if PLANS is empty
            const safePlans = { ...PLANS };
            if (Object.keys(safePlans).length === 0) {
                safePlans[process.env.STRIPE_STARTER_PRICE_ID!] = "starter";
                safePlans[process.env.STRIPE_PRO_PRICE_ID!] = "pro";
            }

            const plan = priceId ? (safePlans[priceId] ?? "pro") : "pro";

            await supabase.from("profiles").upsert({
                id: user.id,
                email: user.email,
                subscription_status: plan,
                plan,
                stripe_customer_id: session.customer as string,
                updated_at: new Date().toISOString(),
            }, { onConflict: "id" });

            return NextResponse.json({ success: true, plan });
        }

        return NextResponse.json({ success: true, plan: "free" });
    } catch (err) {
        console.error("[sync-subscription] Error:", err);
        return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
    }
}