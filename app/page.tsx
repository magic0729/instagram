import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-lightPrimaryDark">
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-lightPrimaryDark/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-cblack">
            <span className="text-primary">Just</span>Influence
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-secondary md:flex">
            <a className="hover:text-cblack" href="#features">
              Features
            </a>
            <a className="hover:text-cblack" href="#how">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/creator/login"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-14 pt-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-secondary">
                Analytics-first platform
                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                Creator + Brand dashboards
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-cblack sm:text-5xl">
                Track Instagram growth.
                <br />
                Help brands make decisions.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-secondary">
                Creators connect Instagram to sync performance metrics. Brands review creator analytics to compare,
                shortlist, and make campaign decisions faster.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/creator/login"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Continue with Instagram
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="text-xs font-semibold text-cGrey">For creators</div>
                  <div className="mt-2 text-sm font-semibold text-cblack">Insights & trends</div>
                  <div className="mt-1 text-sm text-secondary">Followers, engagement, reach.</div>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="text-xs font-semibold text-cGrey">For brands</div>
                  <div className="mt-2 text-sm font-semibold text-cblack">Compare creators</div>
                  <div className="mt-1 text-sm text-secondary">Side-by-side evaluation.</div>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="text-xs font-semibold text-cGrey">Security</div>
                  <div className="mt-2 text-sm font-semibold text-cblack">Role-based</div>
                  <div className="mt-1 text-sm text-secondary">JWT + server-side sync.</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
              <div className="rounded-3xl p-5 text-white ji-sideBg">
                <div className="text-sm font-semibold">Creator snapshot</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs text-white/70">Followers</div>
                    <div className="mt-1 text-2xl font-semibold">12,480</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs text-white/70">Engagement rate</div>
                    <div className="mt-1 text-2xl font-semibold">4.23%</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs text-white/70">Reach</div>
                    <div className="mt-1 text-2xl font-semibold">98k</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs text-white/70">Impressions</div>
                    <div className="mt-1 text-2xl font-semibold">141k</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                  <div className="text-xs font-semibold text-cGrey">Sync</div>
                  <div className="mt-1 text-sm font-semibold text-cblack">On demand</div>
                  <div className="mt-1 text-sm text-secondary">Manual + cron.</div>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                  <div className="text-xs font-semibold text-cGrey">Storage</div>
                  <div className="mt-1 text-sm font-semibold text-cblack">MongoDB</div>
                  <div className="mt-1 text-sm text-secondary">Aggregation-ready.</div>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                  <div className="text-xs font-semibold text-cGrey">Auth</div>
                  <div className="mt-1 text-sm font-semibold text-cblack">JWT cookies</div>
                  <div className="mt-1 text-sm text-secondary">Role-checked routes.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pb-14 pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-cblack">Built for analytics</h2>
              <p className="mt-1 text-sm text-secondary">Everything is optimized for insight, not posting.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Creator performance",
                desc: "Followers, engagement rate, media performance, trends.",
              },
              {
                title: "Brand evaluation",
                desc: "Browse creators and review their latest metrics and recent content.",
              },
              {
                title: "Reliable syncing",
                desc: "Sync on login, manual sync, optional cron-based syncing.",
              },
              {
                title: "Secure by default",
                desc: "Role-based access and httpOnly JWT cookie sessions.",
              },
              {
                title: "MongoDB-ready analytics",
                desc: "Schemas are designed to support fast aggregations and snapshots.",
              },
              {
                title: "Extensible architecture",
                desc: "Future-ready for campaigns, payments, and creator access grants.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[var(--shadow-soft)]">
                <div className="text-sm font-semibold text-cblack">{f.title}</div>
                <div className="mt-2 text-sm text-secondary">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-6 pb-14 pt-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-2xl font-semibold tracking-tight text-cblack">How it works</h2>
            <p className="mt-1 text-sm text-secondary">A simple flow for creators and brands.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { step: "01", title: "Creator connects Instagram", desc: "Meta OAuth grants access for syncing." },
                { step: "02", title: "We sync and store analytics", desc: "Profile, media, insights + daily snapshots." },
                { step: "03", title: "Brands review dashboards", desc: "Compare creators and make campaign decisions." },
              ].map((s) => (
                <div key={s.step} className="rounded-3xl border border-zinc-200 bg-lightPrimaryDark p-5">
                  <div className="text-xs font-semibold text-cGrey">{s.step}</div>
                  <div className="mt-2 text-sm font-semibold text-cblack">{s.title}</div>
                  <div className="mt-1 text-sm text-secondary">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/creator/login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Connect Instagram
              </Link>
            </div>
          </div>
        </section>

        <section id="dashboards" className="mx-auto max-w-6xl px-6 pb-16 pt-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-cblack">Get started</h2>
                <p className="mt-1 text-sm text-secondary">Connect your Instagram to view analytics.</p>
              </div>
              <Link
                href="/creator/login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Continue with Instagram
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="text-sm font-semibold text-cblack">
            <span className="text-primary">Just</span>Influence
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-secondary">
            <Link className="hover:text-cblack" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-cblack" href="/data-deletion">
              Data deletion
            </Link>
          </div>
          <div className="text-xs text-cGrey">© {new Date().getFullYear()} JustInfluence</div>
        </div>
      </footer>
    </div>
  );
}
