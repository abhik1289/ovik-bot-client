import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-foreground/45 focus-visible:border-black/20 focus-visible:ring-2 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
