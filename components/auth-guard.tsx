"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5efe6] text-[#2b2118]">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#7f6d5a]">
          Checking session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
