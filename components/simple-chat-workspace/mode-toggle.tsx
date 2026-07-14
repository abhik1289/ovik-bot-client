"use client";

import type { Mode } from "./types";

type ModeToggleProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-sidebar-border bg-muted p-1 text-sm">
      <button
        type="button"
        onClick={() => onChange("chat")}
        className={`rounded-lg px-3 py-1.5 transition ${
          mode === "chat"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}>
        Chat
      </button>
      <button
        type="button"
        onClick={() => onChange("rag")}
        className={`rounded-lg px-3 py-1.5 transition ${
          mode === "rag"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}>
        RAG PDF
      </button>
    </div>
  );
}
