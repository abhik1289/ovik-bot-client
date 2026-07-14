"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import { askFromRag, ChatApiError, streamChat, uploadFile } from "@/lib/chat-api";

import { ChatComposer } from "./chat-composer";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatMessage } from "./chat-message";
import { chatStarterPrompts, ragStarterPrompts } from "./constants";
import { ModeToggle } from "./mode-toggle";
import type { Attachment, Message, Mode } from "./types";
import { UploadList } from "./upload-list";
import { buildWelcomeMessage, createId } from "./utils";

export function SimpleChatWorkspace() {
  const [messages, setMessages] = useState<Message[]>([buildWelcomeMessage()]);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<Mode>("chat");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [draft]);

  useEffect(() => {
    return () => {
      cancelStreamRef.current?.();
    };
  }, []);

  const handleReset = () => {
    cancelStreamRef.current?.();
    cancelStreamRef.current = null;
    setIsStreaming(false);
    setDraft("");
    setAttachments([]);
    setMessages([buildWelcomeMessage()]);
  };

  const handleStop = () => {
    cancelStreamRef.current?.();
    cancelStreamRef.current = null;
    setIsStreaming(false);
    setMessages((current) => {
      const next = [...current];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === "assistant" && next[i].streaming) {
          next[i] = {
            ...next[i],
            streaming: false,
            content:
              next[i].content.trim().length > 0
                ? `${next[i].content}\n\n(stopped)`
                : "(stopped)",
          };
          break;
        }
      }
      return next;
    });
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const assistantId = createId();
    setMessages((current) => [
      ...current,
      { id: createId(), role: "user", content: trimmed },
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);
    setDraft("");
    setIsStreaming(true);

    const onChunk = (chunk: string) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: `${message.content}${chunk}`,
                streaming: true,
              }
            : message,
        ),
      );
    };

    const onError = (error: Error) => {
      const message =
        error instanceof ChatApiError
          ? error.message
          : "Something went wrong while generating the response.";

      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? { ...item, streaming: false, error: message }
            : item,
        ),
      );
      setIsStreaming(false);
      cancelStreamRef.current = null;
    };

    const onDone = () => {
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId ? { ...item, streaming: false } : item,
        ),
      );
      setIsStreaming(false);
      cancelStreamRef.current = null;
    };

    if (mode === "rag") {
      cancelStreamRef.current = () => undefined;
      void askFromRag(trimmed)
        .then((answer) => {
          onChunk(answer);
          onDone();
        })
        .catch((error: Error) => onError(error));
      return;
    }

    cancelStreamRef.current = streamChat(trimmed, onChunk, onError, onDone);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(draft);
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const id = createId();
    setAttachments((current) => [
      ...current,
      {
        id,
        name: file.name,
        bytes: file.size,
        status: "uploading",
      },
    ]);

    void uploadFile(file)
      .then((result) => {
        setAttachments((current) =>
          current.map((attachment) =>
            attachment.id === id
              ? {
                  ...attachment,
                  status: "uploaded",
                  message: result.message,
                }
              : attachment,
          ),
        );
      })
      .catch((error: Error) => {
        setAttachments((current) =>
          current.map((attachment) =>
            attachment.id === id
              ? {
                  ...attachment,
                  status: "error",
                  message:
                    error instanceof ChatApiError
                      ? error.message
                      : "Upload failed.",
                }
              : attachment,
          ),
        );
      });

    event.target.value = "";
  };

  const isEmpty = messages.length === 1 && messages[0].role === "assistant";
  const prompts = mode === "rag" ? ragStarterPrompts : chatStarterPrompts;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="border-b border-sidebar-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
          <div>
            <h1 className="text-base font-semibold tracking-tight">AvikBot</h1>
            <p className="text-xs text-muted-foreground">
              Simple chat and PDF RAG flow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle mode={mode} onChange={setMode} />
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm transition hover:bg-muted">
              <RotateCcw className="size-4" />
              New chat
            </button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-6 sm:py-8">
          <UploadList attachments={attachments} />
          {isEmpty ? (
            <ChatEmptyState
              mode={mode}
              prompts={prompts}
              onSelectPrompt={sendMessage}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ChatComposer
        draft={draft}
        mode={mode}
        isStreaming={isStreaming}
        textareaRef={textareaRef}
        fileInputRef={fileInputRef}
        onDraftChange={setDraft}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        onPickFile={handlePickFile}
        onFileSelected={handleFileSelected}
        onStop={handleStop}
      />
    </div>
  );
}
