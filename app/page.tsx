import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Database,
  FileText,
  ShieldCheck,
} from "lucide-react";

const highlights = [
  {
    title: "Real-time chat",
    description: "Stream responses from the backend with a clean, focused interface.",
    icon: Bot,
  },
  {
    title: "Document Q&A",
    description: "Upload PDFs and ask grounded questions using a simple RAG workflow.",
    icon: FileText,
  },
  {
    title: "Structured retrieval",
    description: "Combine vector search with concise prompting for reliable answers.",
    icon: Database,
  },
  {
    title: "Secure by design",
    description: "Built for authenticated access and production-minded backend flows.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f8fa_0%,#ffffff_42%,#f5f6f8_100%)] text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-black/6 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-black/8 bg-white shadow-[0_8px_30px_-18px_rgba(0,0,0,0.35)]">
              <span className="text-sm font-semibold tracking-[0.2em]">A</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                AI Workspace
              </p>
              <h1 className="text-base font-semibold">AvikBot</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#capabilities" className="transition hover:text-foreground">
              Capabilities
            </a>
            <a href="#workflow" className="transition hover:text-foreground">
              Workflow
            </a>
            <Link
              href="/chat"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-foreground transition hover:bg-muted">
              Open App
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-black/8 bg-white/80 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-muted-foreground shadow-[0_12px_40px_-30px_rgba(0,0,0,0.45)]">
              Professional AI Assistant Platform
            </div>

            <h2 className="mt-7 text-5xl font-semibold tracking-[-0.04em] text-[#111317] sm:text-6xl">
              A focused workspace for chat, retrieval, and document-backed answers.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5e6470]">
              AvikBot brings together live AI chat and PDF-based question answering
              in a streamlined interface built for clarity, speed, and practical
              backend integration.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#12151b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1a1f28]">
                Launch Workspace
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#workflow"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted">
                View Workflow
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <Metric label="Streaming" value="Live responses" />
              <Metric label="RAG" value="PDF Q&A" />
              <Metric label="Backend" value="Spring + AI" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(18,21,27,0.08),_transparent_58%)]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white/90 p-6 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.28)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-black/6 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Workspace Preview
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Minimal, production-oriented experience
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="size-2 rounded-full bg-[#cfd4dc]" />
                  <span className="size-2 rounded-full bg-[#cfd4dc]" />
                  <span className="size-2 rounded-full bg-[#cfd4dc]" />
                </div>
              </div>

              <div className="space-y-4 py-6">
                <div className="rounded-2xl bg-[#f5f6f8] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Use case
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#3d4450]">
                    Ask a direct question, stream the answer instantly, or switch
                    to PDF mode to retrieve answers grounded in uploaded content.
                  </p>
                </div>

                <div className="grid gap-3">
                  {highlights.slice(0, 3).map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-2xl border border-black/6 p-4">
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#12151b] text-white">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className="border-y border-black/6 bg-white/80 px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Capabilities
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#111317]">
              Built to stay simple on the surface and practical underneath.
            </h3>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-black/6 bg-[#fbfbfc] p-6 transition hover:bg-white">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#12151b] text-white">
                    <Icon className="size-5" />
                  </div>
                  <h4 className="mt-5 text-lg font-semibold">{item.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Workflow
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#111317]">
              A straightforward flow you can explain clearly in demos and interviews.
            </h3>
          </div>

          <div className="grid gap-4">
            <WorkflowStep
              number="01"
              title="Open the workspace"
              description="Start with direct AI chat or switch into PDF-backed RAG mode from the same interface."
            />
            <WorkflowStep
              number="02"
              title="Upload and index a PDF"
              description="The backend reads the PDF, chunks the text, and stores embeddings in the vector database."
            />
            <WorkflowStep
              number="03"
              title="Ask grounded questions"
              description="Relevant chunks are retrieved first, then passed into the model as context for a concise answer."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/6 bg-white/75 px-4 py-4 shadow-[0_16px_40px_-36px_rgba(0,0,0,0.5)]">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-black/6 bg-white p-6 shadow-[0_24px_60px_-50px_rgba(0,0,0,0.4)]">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {number}
      </p>
      <h4 className="mt-3 text-lg font-semibold text-foreground">{title}</h4>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
