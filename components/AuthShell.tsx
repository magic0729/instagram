import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  topRight,
  variant = "default",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  topRight?: React.ReactNode;
  variant?: "default" | "admin";
}) {
  const isAdmin = variant === "admin";
  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className={`hidden lg:flex flex-col justify-between px-10 py-10 text-white ${isAdmin ? "bg-[#0b1220]" : "ji-sideBg"}`}>
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight">
              JustInfluence
            </Link>
          </div>
          <div className="max-w-md space-y-3">
            <div className="text-4xl font-semibold leading-tight">{title}</div>
            <div className="text-white/80">{subtitle}</div>
          </div>
          <div className="text-xs text-white/70">Analytics-first • Secure • Role-based</div>
        </div>

        <div className="flex flex-col">
          <header className="flex items-center justify-between px-6 py-6">
            <Link href="/" className="text-lg font-semibold tracking-tight lg:hidden">
              <span className="text-primary">Just</span>Influence
            </Link>
            {topRight ? <div className="ml-auto">{topRight}</div> : <div />}
          </header>

          <main className="flex flex-1 items-center justify-center px-6 pb-12">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
