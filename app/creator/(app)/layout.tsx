import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { SideNav } from "@/components/SideNav";

export default function CreatorAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-6 py-6">
      <aside className="hidden w-64 shrink-0 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[var(--shadow-soft)] lg:block">
        <div className="rounded-3xl p-4 text-white ji-sideBg">
          <Link href="/creator/dashboard" className="text-sm font-semibold tracking-tight">
            JustInfluence <span className="text-white/70">/ Creator</span>
          </Link>
          <div className="mt-2 text-xs text-white/80">Analytics dashboard</div>
        </div>
        <SideNav items={[{ label: "Dashboard", href: "/creator/dashboard" }]} />
        <div className="mt-8">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <header className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white px-5 py-4 shadow-[var(--shadow-soft)] lg:hidden">
          <Link href="/creator/dashboard" className="text-sm font-semibold tracking-tight">
            <span className="text-primary">Just</span>Influence <span className="text-zinc-400">/ Creator</span>
          </Link>
          <LogoutButton />
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

