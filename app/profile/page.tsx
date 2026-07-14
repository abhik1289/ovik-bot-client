"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { AccountActionsCard } from "@/components/profile/account-actions-card";
import { ProfileDetailsCard } from "@/components/profile/profile-details-card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileShell } from "@/components/profile/profile-shell";
import { ProfileLoading } from "./profile-loading";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/?next=${encodeURIComponent(pathname || "/profile")}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return <ProfileLoading />;
  }

  return (
    <ProfileShell
      title="Profile"
      description="Manage how AvikBot sees you. Your account details are synced securely from Google.">
      <ProfileHeader user={user} />
      <ProfileDetailsCard user={user} />
      <AccountActionsCard />
    </ProfileShell>
  );
}
