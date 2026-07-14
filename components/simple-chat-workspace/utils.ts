import type { Message } from "./types";

export function createId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildWelcomeMessage(): Message {
  return {
    id: createId(),
    role: "assistant",
    content: "Hi, I'm AvikBot. Send a message and I'll stream the reply here.",
  };
}
