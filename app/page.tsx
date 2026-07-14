"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { GoogleLoginButton } from "@/components/google-login-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/chat";

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, user, nextPath, router]);

  const handleTryME = async () => {
    // Redirect to the backend's Google OAuth2 authorization endpoint

    const token = localStorage.getItem("OVIKBOT_TOKEN");

    const res = await fetch("http://localhost:8080/api/user/me", {
      method: "GET",
      headers: {
        authorization: "Bearer " + token,
      },
    });
    console.log(res.status);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,238,228,0.96)_38%,_rgba(231,220,205,0.94)_100%)] px-4 py-8 text-[#23180f] sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[36px] border border-black/8 bg-white/60 p-8 shadow-[0_30px_120px_-48px_rgba(0,0,0,0.45)] backdrop-blur lg:p-10">
          <div>
            <Badge className="bg-[#171717] text-white">
              Google Sign-In Only
              <Button onClick={handleTryME}>TRY ME</Button>
            </Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Secure access to AvikBot with your Google account.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f4f3d]">
              You click sign-in, Spring Security talks to Google on your behalf,
              and every protected API is available only through a JWT session
              cookie set by the backend.
            </p>
          </div>

          <div className="grid gap-4 pt-8 sm:grid-cols-3">
            <Card className="border-black/8 bg-white/72 shadow-none">
              <CardContent className="py-6">
                <ShieldCheck className="size-6 text-[#8d6234]" />
                <p className="mt-4 font-medium">Verified Google identity</p>
              </CardContent>
            </Card>
            <Card className="border-black/8 bg-white/72 shadow-none">
              <CardContent className="py-6">
                <Sparkles className="size-6 text-[#8d6234]" />
                <p className="mt-4 font-medium">JWT-protected backend routes</p>
              </CardContent>
            </Card>
            <Card className="border-black/8 bg-white/72 shadow-none">
              <CardContent className="py-6">
                <ArrowRight className="size-6 text-[#8d6234]" />
                <p className="mt-4 font-medium">
                  Direct path into the chat app
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <aside className="flex items-center">
          <Card className="w-full rounded-[32px] border-black/8 bg-[#171717] text-white shadow-[0_24px_90px_-45px_rgba(0,0,0,0.65)]">
            <CardHeader>
              <Badge className="w-fit border-white/10 bg-white/10 text-white">
                Authentication
              </Badge>
              <CardTitle className="mt-3 text-3xl">
                Continue with Google
              </CardTitle>
              <CardDescription className="text-white/70">
                Manual login is disabled. Use your Google account to enter the
                workspace.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <GoogleLoginButton />
              </div>

              {user ? (
                <div className="rounded-3xl bg-white/8 p-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/50">
                    Current session
                  </p>
                  <p className="mt-2 font-medium">{user.name}</p>
                  <p className="text-sm text-white/70">{user.email}</p>
                </div>
              ) : null}

              <Button
                className="w-full rounded-2xl bg-[#d7a86e] text-[#21150b] hover:bg-[#c9985b]"
                onClick={() => router.push("/chat")}
                disabled={!user}>
                Open workspace
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
