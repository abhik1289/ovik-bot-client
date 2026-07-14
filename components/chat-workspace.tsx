"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  LogOut,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Search,
  SendHorizontal,
  Square,
  UploadCloud,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import {
  ChatApiError,
  askFromRag,
  streamChat,
  uploadFile,
} from "@/lib/chat-api";

type Role = "user" | "assistant";

type Attachment = {
  id: string;
  file: File;
  status: "uploading" | "uploaded" | "error";
  message?: string;
};

type Message = {
  id: string;
  role: Role;
  content: string;
  pending?: boolean;
  error?: string;
  /** True while tokens are still streaming in. */
  streaming?: boolean;
};

type Mode = "chat" | "rag";

type Conversation = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  messages: Message[];
  mode: Mode;
};

const starterPrompts = [
  "Draft a professional reply to a client about project timelines.",
  "Summarize the key points from my latest document.",
  "Explain a complex topic in simple terms.",
  "Help me brainstorm names for a new product feature.",
];

const ragStarterPrompts = [
  "What does the knowledge base say about our onboarding process?",
  "Summarize the most recent policy document.",
  "Find anything related to refund procedures.",
  "Quote the section on data retention.",
];

function createId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function buildWelcomeConversation(): {
  conversation: Conversation;
  activeId: string;
} {
  const id = `chat-${Date.now()}`;
  return {
    activeId: id,
    conversation: {
      id,
      title: "New chat",
      preview: "Start a conversation with AvikBot.",
      updatedAt: "Just now",
      mode: "chat",
      messages: [
        {
          id: createId(),
          role: "assistant",
          content:
            "Hi, I'm AvikBot. Ask me anything, or pick one of the suggestions below to get started.",
        },
      ],
    },
  };
}

export function ChatWorkspace() {
  const [{ conversations, activeId }, setConversationState] = useState<{
    conversations: Conversation[];
    activeId: string;
  }>(() => {
    const seed = buildWelcomeConversation();
    return { conversations: [seed.conversation], activeId: seed.activeId };
  });
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyQuery, setHistoryQuery] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const setConversations = (
    updater: (prev: Conversation[]) => Conversation[],
  ) => {
    setConversationState((prev) => ({
      ...prev,
      conversations: updater(prev.conversations),
    }));
  };
  const setActiveId = (id: string) => {
    setConversationState((prev) => ({ ...prev, activeId: id }));
  };

  const { user, signOut } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  );

  const filteredConversations = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.preview.toLowerCase().includes(query),
    );
  }, [conversations, historyQuery]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [
    activeConversation?.messages.length,
    activeConversation?.messages[activeConversation.messages.length - 1]
      ?.content,
    activeConversation?.messages[activeConversation.messages.length - 1]
      ?.streaming,
    isStreaming,
    activeId,
  ]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [draft]);

  // Cleanup any in-flight stream on unmount.
  useEffect(() => {
    return () => {
      cancelStreamRef.current?.();
    };
  }, []);

  const updateConversation = (
    id: string,
    updater: (c: Conversation) => Conversation,
  ) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  };

  const handleNewChat = () => {
    cancelStreamRef.current?.();
    setIsStreaming(false);
    const id = `chat-${Date.now()}`;
    const fresh: Conversation = {
      id,
      title: "New chat",
      preview: "Start a conversation with AvikBot.",
      updatedAt: "Just now",
      mode: activeConversation?.mode ?? "chat",
      messages: [
        {
          id: createId(),
          role: "assistant",
          content:
            activeConversation?.mode === "rag"
              ? "RAG mode is on — attach documents below or ask a question about the knowledge base."
              : "Hi, I'm AvikBot. Ask me anything, or pick one of the suggestions below to get started.",
        },
      ],
    };
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(id);
    setDraft("");
    setAttachments([]);
  };

  const handleSelectConversation = (id: string) => {
    cancelStreamRef.current?.();
    setIsStreaming(false);
    setActiveId(id);
  };

  const handleDeleteConversation = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    cancelStreamRef.current?.();
    setIsStreaming(false);
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId) {
        setActiveId(next[0]?.id ?? "");
      }
      if (next.length === 0) {
        const fresh: Conversation = {
          id: `chat-${Date.now()}`,
          title: "New chat",
          preview: "Start a conversation with AvikBot.",
          updatedAt: "Just now",
          mode: "chat",
          messages: [
            {
              id: createId(),
              role: "assistant",
              content:
                "Hi, I'm AvikBot. Ask me anything, or pick one of the suggestions below to get started.",
            },
          ],
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      return next;
    });
  };

  const handleSetMode = (mode: Mode) => {
    if (!activeConversation) return;
    updateConversation(activeConversation.id, (c) => ({ ...c, mode }));
  };

  const handlePickAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const accepted: Attachment[] = [];
    for (const file of Array.from(files)) {
      const att: Attachment = {
        id: createId(),
        file,
        status: "uploading",
      };
      accepted.push(att);
      // Fire-and-forget upload. The UI updates optimistically.
      uploadFile(file)
        .then((result) => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === att.id
                ? { ...a, status: "uploaded", message: result.message }
                : a,
            ),
          );
        })
        .catch((err: Error) => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === att.id
                ? {
                    ...a,
                    status: "error",
                    message:
                      err instanceof ChatApiError
                        ? err.message
                        : "Upload failed",
                  }
                : a,
            ),
          );
        });
    }

    setAttachments((prev) => [...prev, ...accepted]);
    // Allow re-selecting the same file again.
    event.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleStop = () => {
    cancelStreamRef.current?.();
    cancelStreamRef.current = null;
    setIsStreaming(false);
    if (!activeConversation) return;
    updateConversation(activeConversation.id, (c) => {
      const nextMessages = [...c.messages];
      for (let i = nextMessages.length - 1; i >= 0; i--) {
        if (nextMessages[i].role === "assistant" && nextMessages[i].streaming) {
          nextMessages[i] = {
            ...nextMessages[i],
            streaming: false,
            content:
              (nextMessages[i].content || "") +
              (nextMessages[i].content ? "\n\n_(stopped)_" : "_(stopped)_"),
          };
          break;
        }
      }
      return { ...c, messages: nextMessages };
    });
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    const conv = activeConversation;
    if (!conv) return;
    if (!trimmed || isStreaming) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
    };

    const isFirstUserMessage =
      conv.messages.filter((m) => m.role === "user").length === 0;

    // Build the placeholder assistant message we will stream into.
    const assistantId = createId();
    const placeholderAssistant: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    updateConversation(conv.id, (c) => ({
      ...c,
      messages: [...c.messages, userMessage, placeholderAssistant],
      title: isFirstUserMessage
        ? trimmed.length > 40
          ? `${trimmed.slice(0, 40)}…`
          : trimmed
        : c.title,
      preview: trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed,
      updatedAt: "Just now",
    }));

    setDraft("");
    setIsStreaming(true);

    const onChunk = (chunk: string) => {
      updateConversation(conv.id, (c) => {
        const nextMessages = c.messages.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content + chunk, streaming: true }
            : m,
        );
        return { ...c, messages: nextMessages };
      });
    };

    const onError = (error: Error) => {
      const message =
        error instanceof ChatApiError
          ? error.message
          : "Something went wrong while contacting AvikBot.";
      updateConversation(conv.id, (c) => {
        const nextMessages = c.messages.map((m) =>
          m.id === assistantId ? { ...m, streaming: false, error: message } : m,
        );
        return { ...c, messages: nextMessages };
      });
      setIsStreaming(false);
      cancelStreamRef.current = null;
    };

    const onDone = () => {
      updateConversation(conv.id, (c) => {
        const nextMessages = c.messages.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        );
        return { ...c, messages: nextMessages };
      });
      setIsStreaming(false);
      cancelStreamRef.current = null;
    };

    if (conv.mode === "rag") {
      // RAG path is non-streaming for now (backend returns plain text).
      cancelStreamRef.current = () => undefined;
      askFromRag(trimmed)
        .then((answer) => {
          onChunk(answer);
          onDone();
        })
        .catch((err: Error) => onError(err));
    } else {
      cancelStreamRef.current = streamChat(trimmed, onChunk, onError, onDone);
    }
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

  const handleStarter = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      cancelStreamRef.current?.();
      await signOut();
      router.replace("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isEmpty =
    activeConversation.messages.length === 1 &&
    activeConversation.messages[0].role === "assistant";
  const prompts =
    activeConversation.mode === "rag" ? ragStarterPrompts : starterPrompts;
  const placeholder =
    activeConversation.mode === "rag"
      ? "Ask the knowledge base…"
      : "Message AvikBot…";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden`}>
        <div className="flex h-full w-72 flex-col">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-2 px-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
                <span className="text-sm font-semibold">A</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">
                AvikBot
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close sidebar">
              <PanelLeftClose className="size-4" />
            </button>
          </div>

          <div className="px-3">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-background px-3 py-2.5 text-sm font-medium transition hover:bg-muted">
              <MessageSquarePlus className="size-4" />
              New chat
            </button>
          </div>

          <div className="mt-4 px-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={historyQuery}
                onChange={(event) => setHistoryQuery(event.target.value)}
                placeholder="Search chats"
                className="w-full rounded-md border-0 bg-muted py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto px-2 chat-scroll">
            <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent
            </p>
            <div className="flex flex-col gap-0.5">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeId;
                return (
                  <div
                    key={conversation.id}
                    className={`group relative flex items-center rounded-md transition ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-foreground/80 hover:bg-muted"
                    }`}>
                    <button
                      type="button"
                      onClick={() => handleSelectConversation(conversation.id)}
                      className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-3 py-2.5 text-left">
                      <span className="w-full truncate text-sm">
                        {conversation.title}
                      </span>
                      <span className="w-full truncate text-xs text-muted-foreground">
                        {conversation.preview}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(event) =>
                        handleDeleteConversation(conversation.id, event)
                      }
                      className="mr-2 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-background hover:text-foreground"
                      aria-label="Delete chat">
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
              {filteredConversations.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No chats match your search.
                </p>
              )}
            </div>
          </div>

          {user ? (
            <div className="border-t border-sidebar-border p-3">
              <div className="flex items-center gap-3 rounded-md p-2">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="size-8 rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                    {user.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Sign out"
                  title={isSigningOut ? "Signing out..." : "Sign out"}>
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex h-full min-w-0 flex-1 flex-col bg-background">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Open sidebar">
                <PanelLeftOpen className="size-4" />
              </button>
            )}
            <h1 className="text-sm font-medium">{activeConversation.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle
              mode={activeConversation.mode}
              onChange={handleSetMode}
            />
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
            {isEmpty ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
                  <span className="text-lg font-semibold">A</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {activeConversation.mode === "rag"
                    ? "Ask the knowledge base"
                    : "How can I help today?"}
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  {activeConversation.mode === "rag"
                    ? "Attach documents in the composer or ask a question below."
                    : "Start with a task, a question, or pick one of the suggestions below."}
                </p>
                <div className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleStarter(prompt)}
                      className="rounded-lg border border-sidebar-border bg-background p-3 text-left text-sm text-foreground/80 transition hover:bg-muted">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {activeConversation.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-sidebar-border bg-background">
          <div className="mx-auto w-full max-w-3xl px-4 py-4">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <AttachmentChip
                    key={att.id}
                    attachment={att}
                    onRemove={handleRemoveAttachment}
                  />
                ))}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-2xl border border-sidebar-border bg-background p-2 shadow-sm transition focus-within:border-foreground/30">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelected}
              />
              <button
                type="button"
                onClick={handlePickAttachment}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Attach file">
                <Paperclip className="size-4" />
              </button>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                className="max-h-[200px] min-h-[36px] flex-1 resize-none border-0 bg-transparent py-2 text-sm leading-6 placeholder:text-muted-foreground focus:outline-none focus:ring-0"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition hover:bg-foreground/90"
                  aria-label="Stop generating">
                  <Square className="size-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                  aria-label="Send message">
                  <SendHorizontal className="size-4" />
                </button>
              )}
            </form>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              AvikBot can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) {
  const isRag = mode === "rag";
  return (
    <div
      role="tablist"
      aria-label="Response mode"
      className="inline-flex items-center rounded-full border border-sidebar-border bg-muted p-0.5 text-xs">
      <button
        role="tab"
        type="button"
        aria-selected={!isRag}
        onClick={() => onChange("chat")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
          !isRag
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}>
        <Globe className="size-3.5" />
        Chat
      </button>
      <button
        role="tab"
        type="button"
        aria-selected={isRag}
        onClick={() => onChange("rag")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
          isRag
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}>
        <FileText className="size-3.5" />
        Docs
      </button>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}>
      {!isUser && (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
          <span className="text-xs font-semibold">A</span>
        </div>
      )}
      <div
        className={`prose-message max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-7 sm:text-[15px] ${
          isUser ? "bg-foreground text-background" : "bg-muted text-foreground"
        }`}>
        {message.error ? (
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
            <div>
              <p className="font-medium text-red-600">
                Couldn&apos;t reach AvikBot
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-foreground/80">
                {message.error}
              </p>
            </div>
          </div>
        ) : message.content ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Thinking…
          </span>
        )}
        {message.streaming && message.content && !message.error && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-current align-middle"
          />
        )}
      </div>
      {isUser && (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
          <span className="text-xs font-semibold">U</span>
        </div>
      )}
    </div>
  );
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: (id: string) => void;
}) {
  const { file, status, message } = attachment;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${
        status === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : status === "uploaded"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-sidebar-border bg-muted text-foreground"
      }`}>
      {status === "uploading" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : status === "uploaded" ? (
        <CheckCircle2 className="size-3" />
      ) : status === "error" ? (
        <AlertTriangle className="size-3" />
      ) : (
        <UploadCloud className="size-3" />
      )}
      <span className="max-w-[180px] truncate font-medium">{file.name}</span>
      <span className="text-[10px] opacity-70">{formatBytes(file.size)}</span>
      {message && status !== "uploading" ? (
        <span className="max-w-[140px] truncate text-[10px] opacity-70">
          {message}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="-mr-1 inline-flex size-4 items-center justify-center rounded-full opacity-60 transition hover:bg-black/5 hover:opacity-100"
        aria-label={`Remove ${file.name}`}>
        <X className="size-2.5" />
      </button>
    </div>
  );
}
