"use client";

type ChatEmptyStateProps = {
  mode: "chat" | "rag";
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
};

export function ChatEmptyState({
  mode,
  prompts,
  onSelectPrompt,
}: ChatEmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
        <span className="text-lg font-semibold">A</span>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight">
        {mode === "rag" ? "Ask Your PDF" : "Chat with AvikBot"}
      </h2>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        {mode === "rag"
          ? "Upload a PDF and ask questions using retrieval-augmented generation."
          : "Type a message and the response will stream directly from the backend."}
      </p>
      <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-xl border border-sidebar-border bg-background p-4 text-left text-sm transition hover:bg-muted">
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
