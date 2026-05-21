"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    body: string | null;
    type: string;
    read: boolean;
    created_at: string;
}

export function useNotifications() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw new Error(error.message);
            return (data as Notification[]) ?? [];
        },
        staleTime: 0,
    });

    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const supabase = getSupabase();
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", user.id)
                .eq("read", false);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead: (id: string) => markAsRead.mutate(id),
        markAllAsRead: () => markAllAsRead.mutate(),
    };
}