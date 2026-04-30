/**
 * lib/supabase/server.ts — Supabase client for Server Components and API routes.
 *
 * Critical fix: the original only implemented `cookies.get`. Without `set`
 * and `remove`, the server client cannot refresh expired sessions or write
 * new session cookies. The middleware would create a fresh session, but
 * the server client would immediately fail to read it — causing auth loops.
 *
 * This implementation matches the pattern recommended by Supabase SSR docs:
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions — the middleware handles the Set-Cookie header.
          }
        },
      },
    },
  );
}