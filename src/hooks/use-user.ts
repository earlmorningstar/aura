"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useUser() {
  const [displayName, setDisplayName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);


  useEffect(() => {
    async function get() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();

        setDisplayName(
          profile?.display_name || user.email?.split("@")[0] || "User"
        );
      }
      setLoading(false);
    }
    get();
  }, [refreshKey]);

  return { displayName, loading, refresh };
}