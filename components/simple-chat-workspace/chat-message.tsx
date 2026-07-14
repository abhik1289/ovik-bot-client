"use client";

import { Loader2 } from "lucide-react";

import type { Message } from "./types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}>
      {!isUser && (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
          <span className="text-xs font-semibold">A</span>
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 sm:text-[15px] ${
          isUser ? "bg-foreground text-background" : "bg-muted text-foreground"
        }`}>
        {message.error ? (
          <p className="whitespace-pre-wrap break-words text-red-600">
            {message.error}
          </p>
        ) : message.content ? (
          <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
        ) : (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Thinking...
          </span>
        )}
        {message.streaming && message.content && !message.error ? (
          <span
            aria-hidden
            className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-current align-middle"
          />
        ) : null}
      </div>
      {isUser && (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <span className="text-xs font-semibold">U</span>
        </div>
      )}
    </div>
  );
}
