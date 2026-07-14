"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function AuthFailurePage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,238,228,0.96)_38%,_rgba(231,220,205,0.94)_100%)] px-4 text-[#23180f]">
      <div className="w-full max-w-md rounded-3xl border border-black/8 bg-white/85 p-8 shadow-[0_30px_120px_-48px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-sm uppercase tracking-[0.22em] text-[#8d6234]">
          Authentication
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          We couldn&apos;t sign you in
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#5f4f3d]">
          {reason
            ? decodeURIComponent(reason)
            : "Something went wrong while completing the Google sign-in flow. Please try again."}
        </p>

        <div className="mt-6 flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
