import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-foreground/70 uppercase",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
