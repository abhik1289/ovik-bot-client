"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  PanelLeft,
  Plus,
  Search,
  SendHorizonal,
  Sparkles,
  Stars,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const historyItems = [
  {
    title: "Q3 planning sync",
    preview: "Summaries, blockers, and next sprint notes",
    time: "2 min ago",
  },
  {
    title: "Marketing launch copy",
    preview: "Homepage headlines and CTA variations",
    time: "18 min ago",
  },
  {
    title: "Investor FAQ draft",
    preview: "Tightened responses around roadmap and pricing",
    time: "Yesterday",
  },
  {
    title: "Design review notes",
    preview: "Collected action items from the product critique",
    time: "Yesterday",
  },
];

const messages = [
  {
    role: "assistant",
    content:
      "Welcome back. I can help draft answers, refine product thinking, and keep your work organized in one place.",
  },
  {
    role: "user",
    content: "Prepare a concise reply for a client asking about onboarding timelines.",
  },
  {
    role: "assistant",
    content:
      "Absolutely. A polished response could confirm the usual kickoff window, outline the first milestones, and invite the client to share deadlines so we can tailor the rollout.",
  },
];

const indexedFiles = [
  { name: "Product requirements.pdf", size: "4.8 MB", status: "Indexed" },
  { name: "Sales handbook.pdf", size: "2.1 MB", status: "Ready" },
  { name: "Support playbook.pdf", size: "1.7 MB", status: "Ready" },
];

export function ChatWorkspace() {
  const [historyQuery, setHistoryQuery] = useState("");
  const [activeTab, setActiveTab] = useState("assistant");

  const filteredHistory = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();

    if (!query) {
      return historyItems;
    }

    return historyItems.filter((item) =>
      `${item.title} ${item.preview}`.toLowerCase().includes(query)
    );
  }, [historyQuery]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(245,240,233,0.94)_35%,_rgba(231,224,214,0.92)_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="hidden w-[320px] shrink-0 flex-col rounded-[28px] border border-black/8 bg-white/60 p-5 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur xl:flex">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/45">
                Workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                AvikBot
              </h2>
            </div>
            <Button size="icon" variant="secondary" className="rounded-2xl">
              <PanelLeft className="size-4" />
            </Button>
          </div>

          <Card className="mt-6 border-0 bg-[#171717] text-white shadow-none">
            <CardHeader>
              <Badge className="w-fit border-white/10 bg-white/10 text-white/70">
                Pro Assistant
              </Badge>
              <CardTitle className="mt-3 text-xl">
                Focused conversations for serious work
              </CardTitle>
              <CardDescription className="text-white/70">
                Search past chats, jump between sessions, and keep your context
                close.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-foreground/70">
              Search history
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
              <Input
                value={historyQuery}
                onChange={(event) => setHistoryQuery(event.target.value)}
                placeholder="Find a previous conversation"
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-1 flex-col gap-3 overflow-hidden">
            {filteredHistory.map((item) => (
              <button
                key={item.title}
                type="button"
                className="rounded-2xl border border-black/8 bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-foreground/58">
                      {item.preview}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 size-4 shrink-0 text-foreground/35" />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-foreground/35">
                  {item.time}
                </p>
              </button>
            ))}
          </div>

          <Button className="mt-5 rounded-2xl">
            <Plus className="size-4" />
            New chat session
          </Button>
        </aside>

        <main className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[32px] border border-black/8 bg-white/55 p-4 shadow-[0_24px_90px_-45px_rgba(0,0,0,0.45)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 border-b border-black/8 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge>Professional AI Workspace</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                Chat, search history, and PDF intelligence in one clean desk.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/62 md:text-base">
                A refined assistant experience with a searchable sidebar,
                polished conversation flow, and a document tab for uploading
                PDFs and asking focused questions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-black/8 bg-white/70">
                <CardContent className="flex items-center gap-3 py-5">
                  <div className="rounded-2xl bg-[#131313] p-3 text-white">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-foreground/40">
                      Active mode
                    </p>
                    <p className="mt-1 font-medium">Context-aware assistant</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-black/8 bg-white/70">
                <CardContent className="flex items-center gap-3 py-5">
                  <div className="rounded-2xl bg-[#d7a86e] p-3 text-[#1f140a]">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-foreground/40">
                      Documents
                    </p>
                    <p className="mt-1 font-medium">PDF search ready</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs
            defaultValue="assistant"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-6 flex flex-1 flex-col"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList>
                <TabsTrigger value="assistant">Chat Assistant</TabsTrigger>
                <TabsTrigger value="pdf">PDF Search</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <Badge className="hidden sm:inline-flex">
                  {activeTab === "assistant"
                    ? "Live conversation mode"
                    : "Document research mode"}
                </Badge>
                <Button variant="secondary" className="rounded-2xl">
                  <Stars className="size-4" />
                  Smart suggestions
                </Button>
              </div>
            </div>

            <TabsContent value="assistant" className="mt-6 flex flex-1 flex-col">
              <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
                <Card className="border-black/8 bg-white/78">
                  <CardHeader className="border-b border-black/8 pb-4">
                    <CardTitle className="text-xl">Conversation</CardTitle>
                    <CardDescription>
                      A clean message canvas with a premium editorial feel.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex h-full flex-col gap-4 pt-5">
                    <div className="flex-1 space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={`max-w-[85%] rounded-[24px] px-5 py-4 shadow-sm ${
                            message.role === "assistant"
                              ? "bg-[#171717] text-white"
                              : "ml-auto bg-[#efe7dd] text-[#2f251b]"
                          }`}
                        >
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
                            {message.role}
                          </p>
                          <p className="text-sm leading-7">{message.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] border border-black/8 bg-[#fbfaf7] p-4">
                      <Textarea
                        placeholder="Message your assistant with a polished, task-focused prompt..."
                        className="min-h-32 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                      />
                      <div className="mt-4 flex flex-col gap-3 border-t border-black/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                          <Badge>Fast replies</Badge>
                          <Badge>Context retained</Badge>
                          <Badge>Professional tone</Badge>
                        </div>
                        <Button className="rounded-2xl">
                          <SendHorizonal className="size-4" />
                          Send message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  <Card className="border-black/8 bg-white/78">
                    <CardHeader>
                      <CardTitle>Session overview</CardTitle>
                      <CardDescription>
                        Keep the most useful controls visible without clutter.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <div className="rounded-2xl bg-[#f6f1ea] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-foreground/38">
                          Current task
                        </p>
                        <p className="mt-2 font-medium">
                          Client communication and knowledge work
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f8f8f8] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-foreground/38">
                          Style profile
                        </p>
                        <p className="mt-2 font-medium">
                          Concise, helpful, and executive-ready
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-black/8 bg-white/78">
                    <CardHeader>
                      <CardTitle>Suggested starters</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {[
                        "Summarize the latest thread into action items.",
                        "Rewrite this reply in a more professional tone.",
                        "Compare two onboarding plans and highlight tradeoffs.",
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="rounded-2xl border border-black/8 bg-white p-4 text-left text-sm leading-6 text-foreground/72 transition hover:bg-[#faf7f2]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="mt-6 flex flex-1 flex-col">
              <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
                <Card className="border-black/8 bg-white/78">
                  <CardHeader className="border-b border-black/8 pb-4">
                    <CardTitle className="text-xl">PDF knowledge search</CardTitle>
                    <CardDescription>
                      Upload reference files, index them, then ask precise
                      questions across your documents.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5 pt-5">
                    <div className="rounded-[28px] border border-dashed border-black/15 bg-[#fbfaf7] p-6">
                      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-[#171717] p-3 text-white">
                            <Upload className="size-5" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">
                              Drop PDF files here or browse to upload
                            </p>
                            <p className="mt-1 text-sm leading-6 text-foreground/58">
                              Ideal for contracts, manuals, reports, research,
                              and internal documentation.
                            </p>
                          </div>
                        </div>
                        <Button className="rounded-2xl">
                          <Upload className="size-4" />
                          Upload PDF
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <Input placeholder="Ask something like: What are the refund conditions in the policy PDF?" />
                      <Button className="rounded-2xl">Search document</Button>
                    </div>

                    <Card className="border-black/8 bg-[#fbfaf7] shadow-none">
                      <CardHeader>
                        <CardTitle>Example result</CardTitle>
                        <CardDescription>
                          Answers can cite the most relevant section and pull a
                          concise explanation into view.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-2xl bg-white p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-foreground/38">
                            From section 4.2
                          </p>
                          <p className="mt-3 text-sm leading-7 text-foreground/74">
                            Refunds are eligible within 14 days of purchase when
                            the account has not exceeded usage limits. The answer
                            panel can also surface nearby clauses for context.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <Card className="border-black/8 bg-white/78">
                  <CardHeader>
                    <CardTitle>Indexed library</CardTitle>
                    <CardDescription>
                      Recent PDFs stay visible so the workspace always feels
                      organized.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {indexedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="rounded-2xl border border-black/8 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div className="rounded-2xl bg-[#f2eadf] p-3 text-[#5b4531]">
                              <FileText className="size-4" />
                            </div>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="mt-1 text-sm text-foreground/52">
                                {file.size}
                              </p>
                            </div>
                          </div>
                          <Badge>{file.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
