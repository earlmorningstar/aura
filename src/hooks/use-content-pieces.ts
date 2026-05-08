"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { ContentPiece } from "@/components/content/content-performance-cards";

function getSupabase() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Maps frontend camelCase to Supabase snake_case columns
function toDbPiece(piece: Omit<ContentPiece, "id">) {
    return {
        title: piece.title,
        platform: piece.platform,
        published_at: piece.publishedAt,
        content_type: piece.contentType || "video",
        engagement_rate: piece.engagementRate ? parseFloat(piece.engagementRate) : null,
        engagement_delta: piece.engagementDelta ?? null,
        revenue: piece.revenue ?? 0,
        revenue_delta: piece.revenueDelta ?? null,
        views: piece.views ?? 0,
        likes: piece.likes ?? 0,
        trend: piece.trend ?? "neutral",
    };
}

export function useContentPieces() {
    const queryClient = useQueryClient();

    const { data: pieces = [], isLoading } = useQuery<ContentPiece[]>({
        queryKey: ["content-pieces"],
        queryFn: async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("content_pieces")
                .select("*")
                .order("published_at", { ascending: false });

            if (error) throw new Error(error.message);

            // Map DB snake_case → camelCase for the UI
            return ((data as any[]) ?? []).map((row) => ({
                id: row.id,
                title: row.title,
                platform: row.platform,
                publishedAt: row.published_at,
                engagementRate: row.engagement_rate?.toString() ?? "—",
                engagementDelta: row.engagement_delta ?? 0,
                revenue: row.revenue ?? 0,
                revenueDelta: row.revenue_delta ?? 0,
                views: row.views ?? 0,
                likes: row.likes ?? 0,
                trend: row.trend ?? "neutral",
                trendData: [],
            })) as ContentPiece[];
        },
        staleTime: 60 * 1000,
    });

    const addMutation = useMutation({
        mutationFn: async (piece: Omit<ContentPiece, "id">) => {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const insertData = {
                ...toDbPiece(piece),
                user_id: user.id,
                workspace_id: "personal",
            };

            const { data, error } = await supabase
                .from("content_pieces")
                .insert(insertData)
                .select("*")
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["content-pieces"] });
        },
    });

    return {
        pieces,
        isLoading,
        addPiece: (piece: Omit<ContentPiece, "id">) => addMutation.mutate(piece),
    };
}