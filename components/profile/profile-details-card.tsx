"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Mail, ShieldCheck, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthUser } from "@/lib/auth";

interface ProfileDetailsCardProps {
  user: AuthUser;
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  monospace?: boolean;
  copyable?: string;
}

function DetailRow({ icon, label, value, monospace, copyable }: RowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(copyable);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable in some browsers; fail silently.
    }
  };

  return (
    <div className="group flex items-start justify-between gap-4 rounded-xl px-3 py-3 transition hover:bg-[#f5efe6]/70">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#8d6234] ring-1 ring-black/5">
          {icon}
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7f6d5a]">
            {label}
          </p>
          <p
            className={
              monospace
                ? "truncate font-mono text-sm text-[#23180f]"
                : "truncate text-sm text-[#23180f]"
            }>
            {value}
          </p>
        </div>
      </div>
      {copyable ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[#7f6d5a] transition hover:bg-white hover:text-[#23180f]">
          {copied ? (
            <Check className="size-4 text-[#10a37f]" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      ) : null}
    </div>
  );
}

export function ProfileDetailsCard({ user }: ProfileDetailsCardProps) {
  return (
    <Card className="border-black/8 bg-white/72 shadow-[0_24px_90px_-55px_rgba(0,0,0,0.45)]">
      <CardHeader>
        <CardTitle className="text-lg">Account details</CardTitle>
        <CardDescription>
          Information synced from your Google identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 pb-6">
        <DetailRow
          icon={<User className="size-4" />}
          label="Display name"
          value={user.name}
        />
        <DetailRow
          icon={<Mail className="size-4" />}
          label="Email"
          value={user.email}
          copyable={user.email}
        />
        <DetailRow
          icon={<ShieldCheck className="size-4" />}
          label="Role"
          value={
            <Badge
              className={
                user.role === "ADMIN"
                  ? "border-transparent bg-[#10a37f] text-white"
                  : "border-black/10 bg-white/80 text-[#5f4f3d]"
              }>
              {user.role}
            </Badge>
          }
        />
        <DetailRow
          icon={<KeyRound className="size-4" />}
          label="User ID"
          value={user.id}
          monospace
          copyable={user.id}
        />
      </CardContent>
    </Card>
  );
}
