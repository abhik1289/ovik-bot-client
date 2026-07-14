"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

/**
 * Spring Security's {@code OAuth2AuthenticationSuccessHandler} redirects here
 * with {@code ?token=<jwt>}. The session cookie has already been set by the
 * backend on the response that landed us on this page, so all we need to do
 * is:
 *   1. Refresh the in-memory user (so /chat renders without a round-trip).
 *   2. Replace history with the requested destination.
 *
 * The token in the query string is optional but useful as a one-shot signal
 * that the OAuth dance completed.
 */
function AuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get("token");
    const next = searchParams.get("next") || "/chat";

    if (!token) {
      // No token means something went wrong with the redirect — bail out.
      router.replace("/auth/failure");
      return;
    }

    // Persist the one-shot token to localStorage so subsequent XHRs can
    // authenticate via `Authorization: Bearer ...` (avoids SameSite cookie
    // restrictions during local development).
    try {
      window.localStorage.setItem("OVIKBOT_TOKEN", token);
    } catch {
      // ignore storage failures
    }

    void (async () => {
      await refresh();
      router.replace(next);
    })();
  }, [refresh, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,238,228,0.96)_38%,_rgba(231,220,205,0.94)_100%)] text-[#23180f]">
      <div className="rounded-3xl border border-black/8 bg-white/80 px-8 py-10 shadow-[0_30px_120px_-48px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-sm uppercase tracking-[0.22em] text-[#8d6234]">
          AvikBot
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Signing you in…</h1>
        <p className="mt-3 text-sm text-[#5f4f3d]">
          Hold tight while we drop you into the workspace.
        </p>
      </div>
    </main>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#5f4f3d]">Loading…</p>
        </main>
      }>
      <AuthSuccessInner />
    </Suspense>
  );
}
