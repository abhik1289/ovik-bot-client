"use client";

/**
 * Single source of truth for the chat sidebar's history.
 *
 * Responsibilities:
 *   - Hydrate from the backend on mount.
 *   - Keep a local map of {@link Conversation}-shaped rows that mirrors the
 *     backend response shape.
 *   - Debounce per-row saves (300ms) and expose a flush for explicit
 *     {@code pagehide} saves.
 *   - Surface loading / error state to the UI.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ChatHistoryConversation,
  type ChatHistoryMessage,
  deleteConversation as apiDelete,
  listConversations,
  setPinned as apiSetPinned,
  upsertConversation as apiUpsert,
} from "@/lib/chat-history";

export type Conversation = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  mode: "chat" | "rag";
  pinned: boolean;
  messages: ChatHistoryMessage[];
};

export type UseChatHistoryState = {
  loading: boolean;
  error: string | null;
  conversations: Conversation[];
  upsert: (id: string, partial: Partial<Conversation>) => void;
  remove: (id: string) => void;
  togglePin: (id: string) => Promise<void>;
  flush: () => Promise<void>;
};

const SAVE_DEBOUNCE_MS = 300;

function toConversation(c: ChatHistoryConversation): Conversation {
  return {
    id: c.id,
    title: c.title,
    preview: c.preview,
    updatedAt: c.updatedAt,
    mode: c.mode,
    pinned: c.pinned,
    messages: c.messages ?? [],
  };
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function useChatHistory(): UseChatHistoryState {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the most-recent snapshot per id so a debounced flush always uses
  // the freshest in-memory state, even if React hasn't re-rendered yet.
  const latestRef = useRef<Map<string, Conversation>>(new Map());
  // Track which ids have been mutated since the last flush so we only save
  // dirty rows (saves on N round-trips per keystroke).
  const dirtyRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const inFlightRef = useRef<Map<string, Promise<void>>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listConversations();
        if (cancelled) return;
        const rows = list.map(toConversation).map((c) => ({
          ...c,
          updatedAt: relativeTime(c.updatedAt),
        }));
        latestRef.current = new Map(rows.map((c) => [c.id, c]));
        setConversations(rows);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistOne = useCallback(async (id: string) => {
    const row = latestRef.current.get(id);
    if (!row) return;
    const existing = inFlightRef.current.get(id);
    if (existing) {
      // Chain: subsequent saves wait for the in-flight one, then re-run.
      await existing;
    }
    const run = (async () => {
      try {
        const saved = await apiUpsert(id, {
          title: row.title,
          preview: row.preview,
          mode: row.mode,
          pinned: row.pinned,
          messages: row.messages,
        });
        latestRef.current.set(id, toConversation(saved));
        setConversations((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...toConversation(saved),
                  updatedAt: relativeTime(saved.updatedAt),
                }
              : c,
          ),
        );
        dirtyRef.current.delete(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      } finally {
        inFlightRef.current.delete(id);
      }
    })();
    inFlightRef.current.set(id, run);
    await run;
  }, []);

  const scheduleSave = useCallback(
    (id: string) => {
      const prev = timersRef.current.get(id);
      if (prev) clearTimeout(prev);
      const t = setTimeout(() => {
        timersRef.current.delete(id);
        void persistOne(id);
      }, SAVE_DEBOUNCE_MS);
      timersRef.current.set(id, t);
    },
    [persistOne],
  );

  const upsert = useCallback(
    (id: string, partial: Partial<Conversation>) => {
      const current: Conversation = latestRef.current.get(id) ?? {
        id,
        title: "New chat",
        preview: "",
        updatedAt: "Just now",
        mode: "chat",
        pinned: false,
        messages: [],
      };
      const next: Conversation = {
        ...current,
        ...partial,
        updatedAt: "Just now",
      };
      latestRef.current.set(id, next);
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === id);
        if (idx === -1) return [...prev, next];
        const copy = prev.slice();
        copy[idx] = next;
        return copy;
      });
      dirtyRef.current.add(id);
      scheduleSave(id);
    },
    [scheduleSave],
  );

  const remove = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    dirtyRef.current.delete(id);
    latestRef.current.delete(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    void apiDelete(id).catch(() => {
      // Soft-delete errors are non-fatal for the UX.
    });
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const row = latestRef.current.get(id);
    if (!row) return;
    const desired = !row.pinned;
    // Optimistic update
    const optimistic = { ...row, pinned: desired, updatedAt: "Just now" };
    latestRef.current.set(id, optimistic);
    setConversations((prev) => prev.map((c) => (c.id === id ? optimistic : c)));
    const saved = await apiSetPinned(id, desired);
    if (saved) {
      const normalised = {
        ...toConversation(saved),
        updatedAt: relativeTime(saved.updatedAt),
      };
      latestRef.current.set(id, normalised);
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === id ? normalised : c));
        // pinned-first sort
        return next.slice().sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return 0;
        });
      });
    } else {
      // Revert if backend says no.
      latestRef.current.set(id, row);
      setConversations((prev) => prev.map((c) => (c.id === id ? row : c)));
    }
  }, []);

  const flush = useCallback(async () => {
    // Cancel pending debounce timers; persist immediately.
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    const ids = Array.from(dirtyRef.current);
    await Promise.all(ids.map((id) => persistOne(id)));
  }, [persistOne]);

  // Flush in-flight saves on unmount so we don't drop typing.
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  return useMemo(
    () => ({ loading, error, conversations, upsert, remove, togglePin, flush }),
    [loading, error, conversations, upsert, remove, togglePin, flush],
  );
}
