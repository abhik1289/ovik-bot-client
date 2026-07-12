import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-foreground/45 focus-visible:border-black/20 focus-visible:ring-2 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
