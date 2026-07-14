"use client";

import type { Attachment } from "./types";

type UploadListProps = {
  attachments: Attachment[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadList({ attachments }: UploadListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={`rounded-full border px-3 py-1 text-xs ${
            attachment.status === "uploaded"
              ? "border-green-200 bg-green-50 text-green-700"
              : attachment.status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-sidebar-border bg-muted text-foreground"
          }`}>
          <span className="font-medium">{attachment.name}</span>
          <span className="ml-2 opacity-70">{formatBytes(attachment.bytes)}</span>
          {attachment.message ? (
            <span className="ml-2 opacity-70">{attachment.message}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
