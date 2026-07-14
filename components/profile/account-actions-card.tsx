"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";

export function AccountActionsCard() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Card className="border-black/8 bg-white/72 shadow-[0_24px_90px_-55px_rgba(0,0,0,0.45)]">
      <CardHeader>
        <CardTitle className="text-lg">Account actions</CardTitle>
        <CardDescription>
          Manage your session and account-level controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-6">
        <div className="flex flex-col gap-3 rounded-xl border border-black/8 bg-[#f5efe6]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#23180f]">Sign out</p>
            <p className="text-xs text-[#7f6d5a]">
              End your current session on this device. You can sign back in with
              Google at any time.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={signingOut}
            className="shrink-0">
            {signingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-red-200/70 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#7a1f1f]">Delete account</p>
            <p className="text-xs text-[#9c5b5b]">
              Permanently remove your profile, conversations, and uploaded
              documents.
            </p>
          </div>
          {confirmingDelete ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled
                title="Account deletion is not available yet"
                className="bg-red-600 text-white hover:bg-red-600 disabled:opacity-70">
                <Trash2 className="size-4" />
                Coming soon
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              className="shrink-0 border-red-200/70 bg-white text-[#7a1f1f] hover:bg-red-50">
              <Trash2 className="size-4" />
              Delete account
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
