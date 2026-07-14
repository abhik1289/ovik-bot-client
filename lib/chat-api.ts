"use client";

/**
 * Thin client for the OvikBot Spring backend chat endpoints.
 *
 * All endpoints require an authenticated session (JWT cookie set by
 * the OAuth2 success handler). Credentials are always included so the
 * cookie is sent on cross-origin requests to the backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export type ChatSource = {
  /** Document name / chunk title returned by the RAG pipeline. */
  name?: string;
  /** Optional snippet of the matched content. */
  snippet?: string;
  /** Optional score (cosine similarity). */
  score?: number;
};

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  /** `true` while the assistant stream is still producing tokens. */
  pending?: boolean;
  /** Set when the request failed so the UI can render the error inline. */
  error?: string;
};

export type UploadResult = {
  filename: string;
  bytes: number;
  message: string;
};

/** Plain error returned by the backend when something goes wrong. */
type ApiErrorPayload = {
  error?: string;
  message?: string;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorPayload;
    return data.error ?? data.message ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export class ChatApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new ChatApiError(await parseError(response), response.status);
  }
  // Some endpoints (e.g. /chat/ask) return plain text.
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

/** Simple, non-streaming chat completion backed by the Gemini model. */
export async function sendChat(
  message: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message }),
    signal,
  });
  if (!response.ok) {
    throw new ChatApiError(await parseError(response), response.status);
  }
  const data = (await response.json()) as { response?: string };
  return data.response ?? "";
}

/** RAG-augmented chat completion. Returns plain text. */
export async function askFromRag(
  message: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message }),
    signal,
  });
  if (!response.ok) {
    throw new ChatApiError(await parseError(response), response.status);
  }
  return await response.text();
}

/**
 * Streaming chat completion via Server-Sent Events.
 *
 * The backend's `GET /chat/stream` produces `text/event-stream` with one
 * `data: <chunk>` frame per token. We parse them and yield each chunk to
 * the caller as plain text.
 *
 * The returned cancel function aborts the underlying fetch request.
 */
export function streamChat(
  message: string,
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void,
  onDone?: () => void,
): () => void {
  const controller = new AbortController();
  const url = `${API_BASE_URL}/chat/stream?message=${encodeURIComponent(message)}`;

  void (async () => {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
        headers: { Accept: "text/event-stream" },
      });
      if (!response.ok || !response.body) {
        throw new ChatApiError(await parseError(response), response.status);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let frameEnd = buffer.indexOf("\n\n");
        while (frameEnd !== -1) {
          const frame = buffer.slice(0, frameEnd);
          buffer = buffer.slice(frameEnd + 2);
          frameEnd = buffer.indexOf("\n\n");
          const dataLines = frame
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim());

          if (dataLines.length === 0) continue;
          const payload = dataLines.join("\n");
          if (payload === "[DONE]") continue;
          onChunk(payload);
        }
      }

      onDone?.();
    } catch (error) {
      if (controller.signal.aborted) return;
      onError?.(
        error instanceof Error ? error : new ChatApiError("Stream failed", 0),
      );
    }
  })();

  return () => controller.abort();
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/chat/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    throw new ChatApiError(await parseError(response), response.status);
  }
  return {
    filename: file.name,
    bytes: file.size,
    message: await response.text(),
  };
}

export { API_BASE_URL };
export { postJson };
