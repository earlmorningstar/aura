"use client";

/**
 * Login page — /login
 *
 * Auth flows:
 * 1. Magic link email — send a login link to the user's email
 * 2. Google OAuth — one-click social login
 *
 * After successful auth, Supabase redirects to /auth/callback which
 * handles the session exchange and redirects to `redirectTo` param.
 *
 * Critical fixes from original:
 * - alert() removed
 * - Real Supabase auth implemented
 * - "Demo mode" text removed
 * - Design tokens used throughout
 * - Loading and error states
 * - redirectTo param forwarded to callback
 */

import * as React from "react";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams } from "next/navigation";
import { Mail, Chrome, CheckCircle2, AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { GlassButton } from "@/components/ui/glass-button"
import { ParticleSphere } from "@/components/effects/particle-sphere";


function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type AuthState = "idle" | "loading" | "success" | "error";

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ background: "rgba(var(--glass-border-rgb) / 0.1)" }} />
      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>or</span>
      <div className="h-px flex-1" style={{ background: "rgba(var(--glass-border-rgb) / 0.1)" }} />
    </div>
  );
}

function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [authState, setAuthState] = React.useState<AuthState>("idle");
  const [errorMessage, setError] = React.useState("");
  const [oauthLoading, setOAuth] = React.useState(false);

  // ── Magic link (works for sign‑up and login) ──
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || authState === "loading") return;

    setAuthState("loading");
    setError("");

    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
          shouldCreateUser: true,   // create account if not exists
        },
      });

      if (error) throw error;
      setAuthState("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setAuthState("error");
    }
  }

  // ── Google OAuth ──
  async function handleGoogleAuth() {
    if (oauthLoading) return;
    setOAuth(true);
    setError("");

    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
      setOAuth(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4"
      // style={{ background: "var(--color-bg-void)" }
      style={{ background: "transparent" }}
    >
      {/* Ambient background */}
      {/* <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(var(--accent-cyan-rgb) / 0.06), transparent 70%)",
        }}
      /> */}

      {/* Back to home */}
      <motion.div
        className="absolute left-6 top-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <GlassButton variant="ghost" size="sm" leadingIcon={<ArrowLeft size={13} />} asChild>
          <Link href="/">Home</Link>
        </GlassButton>
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: "rgba(var(--glass-bg-rgb) / var(--glass-opacity-3))",
            backdropFilter: "blur(var(--glass-blur-xl)) saturate(200%)",
            WebkitBackdropFilter: "blur(var(--glass-blur-xl)) saturate(200%)",
            border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity-strong))",
            boxShadow:
              "0 24px 64px -8px rgba(0,0,0,0.55), 0 8px 20px -4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Logo */}
          <motion.div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles size={28} style={{ color: "var(--color-bg-void)" }} />
          </motion.div>

          <AnimatePresence mode="wait">
            {authState === "success" ? (
              <motion.div key="success" className="flex flex-col items-center gap-4 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.1 }}>
                  <CheckCircle2 size={40} style={{ color: "var(--status-success)" }} />
                </motion.div>
                <h1 className="font-display font-bold text-2xl text-white">Check your email</h1>
                <p className="text-sm text-white/70">
                  We sent a magic link to <strong className="text-white">{email}</strong>.
                  Click it to sign in. If you don’t have an account, one will be created automatically.
                </p>
                <GlassButton variant="ghost" size="sm" onClick={() => { setAuthState("idle"); setEmail(""); }}>
                  Use a different email
                </GlassButton>
              </motion.div>
            ) : (
              <motion.div key="form" className="flex flex-col gap-6">
                <div className="text-center">
                  <h1 className="font-display font-bold text-2xl text-white">Welcome to Aura</h1>
                  <p className="mt-2 text-sm text-white/70">
                    Sign in or create a free account to see your creator business in one beautiful place.
                  </p>
                </div>

                <GlassButton
                  variant="ghost"
                  size="md"
                  className="w-full"
                  leadingIcon={<Chrome size={16} />}
                  loading={oauthLoading}
                  onClick={() => void handleGoogleAuth()}
                >
                  Continue with Google
                </GlassButton>

                <OrDivider />

                <form onSubmit={(e) => void handleMagicLink(e)} className="flex flex-col gap-3">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authState === "error") setAuthState("idle");
                    }}
                    className="input w-full"
                    required
                    autoComplete="email"
                    autoFocus
                  />

                  <AnimatePresence>
                    {authState === "error" && errorMessage && (
                      <motion.div
                        role="alert"
                        className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <AlertCircle size={14} />
                        {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <GlassButton
                    variant="primary"
                    size="md"
                    className="w-full"
                    type="submit"
                    loading={authState === "loading"}
                    leadingIcon={<Mail size={15} />}
                    disabled={!email.trim()}
                  >
                    Continue with Email
                  </GlassButton>
                </form>

                <p className="text-center text-xs text-white/40">
                  By continuing you agree to our{" "}
                  <Link href="/terms" className="underline hover:opacity-80">Terms</Link> and{" "}
                  <Link href="/privacy" className="underline hover:opacity-80">Privacy Policy</Link>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-void)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
        </div>
      }
    >
      <ParticleSphere radius={2} count={4000} color="#6366f1" speed={0.7} />
      <LoginPage />
    </Suspense>
  );
}