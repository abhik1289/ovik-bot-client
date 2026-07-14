import Image from "next/image";
import { Mail, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AuthUser } from "@/lib/auth";

interface ProfileHeaderProps {
  user: AuthUser;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const isAdmin = user.role === "ADMIN";

  return (
    <Card className="border-black/8 bg-white/72 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.45)]">
      <CardContent className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center">
        {user.picture ? (
          <Image
            src={user.picture}
            alt={user.name}
            width={96}
            height={96}
            unoptimized
            className="size-24 rounded-2xl object-cover ring-1 ring-black/10"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-2xl bg-[#171717] text-2xl font-semibold text-white ring-1 ring-black/10">
            {getInitials(user.name)}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-2xl font-semibold tracking-tight">
              {user.name}
            </h2>
            <Badge
              className={
                isAdmin
                  ? "border-transparent bg-[#10a37f] text-white"
                  : "border-black/10 bg-white/80 text-[#5f4f3d]"
              }>
              <ShieldCheck className="mr-1 size-3" />
              {user.role}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5f4f3d]">
            <Mail className="size-4 shrink-0 text-[#8d6234]" />
            <span className="truncate">{user.email}</span>
          </div>
          <p className="text-xs text-[#7f6d5a]">
            Signed in with Google · your account is protected by JWT session
            cookies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
