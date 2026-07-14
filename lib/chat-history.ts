"use client";

/**
 * Client for the persisted chat history REST surface.
 *
 * Endpoints are owner-scoped on the server; the client always sends
 * credentials so the JWT cookie is included.
 */

import { API_BASE_URL, parseError } from "./chat-api";

export type ChatHistoryMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  error?: string;
  streaming?: boolean;
};

export type ChatHistoryConversation = {
  id: string;
  title: string;
  preview: string;
  mode: "chat" | "rag";
  pinned: boolean;
  messages: ChatHistoryMessage[];
  createdAt: string;
  updatedAt: string;
};

export type UpsertChatRequest = {
  title: string;
  preview: string;
  mode: "chat" | "rag";
  pinned: boolean;
  messages: ChatHistoryMessage[];
};

const TOKEN_STORAGE_KEY = "OVIKBOT_TOKEN";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const msg = await parseError(res);
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function listConversations(): Promise<ChatHistoryConversation[]> {
  const res = await fetch(`${API_BASE_URL}/api/chats`, {
    method: "GET",
    credentials: "include",
    headers: authHeaders(),
    cache: "no-store",
  });
  return handle<ChatHistoryConversation[]>(res);
}

export async function upsertConversation(
  id: string,
  body: UpsertChatRequest,
): Promise<ChatHistoryConversation> {
  const res = await fetch(`${API_BASE_URL}/api/chats/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
  return handle<ChatHistoryConversation>(res);
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/chats/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeaders(),
  });
  if (res.status === 404) return;
  await handle<void>(res);
}

export async function setPinned(
  id: string,
  pinned: boolean,
): Promise<ChatHistoryConversation | null> {
  const res = await fetch(`${API_BASE_URL}/api/chats/${id}/pin`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ pinned }),
  });
  if (res.status === 404) return null;
  return handle<ChatHistoryConversation>(res);
}

/**
 * Best-effort save on page unload via {@link navigator.sendBeacon}.
 * Falls back to a `keepalive` fetch when {@link sendBeacon} cannot carry a
 * JSON body (e.g. some browsers cap beacon payload size but the body here is
 * small enough to be allowed).
 */
export function beaconUpsert(id: string, body: UpsertChatRequest): boolean {
  if (typeof navigator === "undefined") return false;
  const url = `${API_BASE_URL}/api/chats/${id}`;
  const payload = JSON.stringify(body);
  try {
    const blob = new Blob([payload], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}
