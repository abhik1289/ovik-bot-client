"use client";

import { Paperclip, SendHorizontal, Square } from "lucide-react";

import type { Mode } from "./types";

type ChatComposerProps = {
  draft: string;
  mode: Mode;
  isStreaming: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPickFile: () => void;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStop: () => void;
};

export function ChatComposer({
  draft,
  mode,
  isStreaming,
  textareaRef,
  fileInputRef,
  onDraftChange,
  onSubmit,
  onKeyDown,
  onPickFile,
  onFileSelected,
  onStop,
}: ChatComposerProps) {
  return (
    <div className="border-t border-sidebar-border bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 rounded-2xl border border-sidebar-border bg-background p-2 shadow-sm transition focus-within:border-foreground/30">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onFileSelected}
          />
          {mode === "rag" ? (
            <button
              type="button"
              onClick={onPickFile}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Upload PDF">
              <Paperclip className="size-4" />
            </button>
          ) : null}
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              mode === "rag"
                ? "Upload a PDF, then ask a question about it..."
                : "Message AvikBot..."
            }
            rows={1}
            className="max-h-[200px] min-h-[40px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition hover:bg-foreground/90"
              aria-label="Stop generating">
              <Square className="size-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              aria-label="Send message">
              <SendHorizontal className="size-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
