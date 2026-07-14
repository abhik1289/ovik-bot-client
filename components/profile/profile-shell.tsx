import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ProfileShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ProfileShell({
  title,
  description,
  children,
  className,
}: ProfileShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,238,228,0.96)_38%,_rgba(231,220,205,0.94)_100%)] px-4 py-10 text-[#23180f] sm:px-6">
      <div className={cn("mx-auto flex max-w-3xl flex-col gap-6", className)}>
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-[#5f4f3d] sm:text-base">
              {description}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  );
}
