export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: string;
  streaming?: boolean;
};

export type Mode = "chat" | "rag";

export type Attachment = {
  id: string;
  name: string;
  bytes: number;
  status: "uploading" | "uploaded" | "error";
  message?: string;
};
