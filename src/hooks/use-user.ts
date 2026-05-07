"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useUser() {
  const [displayName, setDisplayName] = useState("there");
  const [loading, setLoading] = useState(true);

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
          profile?.display_name || user.email?.split("@")[0] || "there"
        );
      }
      setLoading(false);
    }
    get();
  }, []);

  return { displayName, loading };
}