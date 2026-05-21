import { supabase } from "@/lib/supabase/client";

export async function notify(
    userId: string,
    title: string,
    body: string,
    type: string = "info"
) {
    await supabase.from("notifications").insert({
        user_id: userId,
        title,
        body,
        type,
    });
}