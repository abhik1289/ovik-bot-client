export function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,238,228,0.96)_38%,_rgba(231,220,205,0.94)_100%)] px-4 py-10 text-[#23180f] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col gap-6">
        <div className="space-y-3">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-black/10" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-black/10" />
        </div>
        <div className="h-44 animate-pulse rounded-2xl bg-black/10" />
        <div className="h-72 animate-pulse rounded-2xl bg-black/10" />
        <div className="h-44 animate-pulse rounded-2xl bg-black/10" />
      </div>
    </div>
  );
}
