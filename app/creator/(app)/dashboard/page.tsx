import { redirect } from "next/navigation";
import Link from "next/link";
import { NoticeToast } from "@/components/NoticeToast";
import { SyncButton } from "@/components/SyncButton";
import { getAuth } from "@/lib/auth/getAuth";
import { getCreatorMedia, getCreatorOverview } from "@/lib/queries/creator";

export default async function CreatorDashboardPage() {
  const auth = await getAuth("creator");
  if (!auth) redirect("/creator/login");

  const instagramAccountId = auth.user.instagramAccountId?.toString?.() ?? null;

  if (!instagramAccountId) {
    return (
      <div className="space-y-6">
        <NoticeToast />
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h1 className="text-2xl font-semibold tracking-tight text-cblack">Dashboard</h1>
          <p className="mt-2 text-sm text-secondary">
            Your account is created, but Instagram analytics are not available yet.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/api/auth/instagram/start"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Reconnect Instagram
            </a>
            <form action="/api/creator/instagram/link" method="post">
              <button
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-cblack hover:bg-zinc-50"
                type="submit"
              >
                Retry detection
              </button>
            </form>
          </div>
          <div className="mt-6 rounded-3xl bg-lightPrimaryDark p-5">
            <div className="text-sm font-semibold text-cblack">What to check</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-secondary">
              <li>Your Instagram account is Business/Creator.</li>
              <li>Your Instagram is connected to a Facebook Page you manage.</li>
              <li>Your Facebook account has full Page access.</li>
            </ul>
            <div className="mt-3 text-sm text-secondary">
              When it’s ready, click <span className="font-semibold text-cblack">Retry detection</span>.
            </div>
          </div>
          <div className="mt-4 text-xs text-cGrey">
            Having trouble? View debug info at <code className="font-mono">/api/debug/meta-oauth/&lt;rid&gt;</code>.
          </div>
        </div>
      </div>
    );
  }

  const [overview, media] = await Promise.all([getCreatorOverview(instagramAccountId), getCreatorMedia(instagramAccountId)]);

  const snapshot = overview.snapshots[0] ?? null;

  return (
    <div className="space-y-6">
      <NoticeToast />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-cblack">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">Your Instagram performance at a glance.</p>
        </div>
        <SyncButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="text-sm font-semibold text-cblack">@{overview.profile.username}</div>
          <div className="mt-2 text-sm text-secondary">
            {overview.profile.accountType ?? "Instagram"} • Last sync{" "}
            {new Date(overview.profile.lastSyncedAt).toLocaleString()}
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="text-sm text-secondary">Followers</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-cblack">{overview.profile.followersCount}</div>
          {snapshot ? <div className="mt-2 text-xs text-cGrey">Snapshot: {snapshot.date}</div> : null}
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="text-sm text-secondary">Engagement rate</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-cblack">
            {overview.profile.engagementRate.toFixed(2)}%
          </div>
          <div className="mt-2 text-xs text-cGrey">Based on recent posts</div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="text-sm font-semibold text-cblack">Recent media</div>
          <div className="text-xs text-cGrey">Latest 25</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-cGrey">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Likes</th>
                <th className="px-6 py-3 font-medium">Comments</th>
                <th className="px-6 py-3 font-medium">Reach</th>
                <th className="px-6 py-3 font-medium">Impressions</th>
                <th className="px-6 py-3 font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {media.items.map((m) => (
                <tr key={m.id} className="text-cblack">
                  <td className="px-6 py-3">{new Date(m.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{m.mediaType}</td>
                  <td className="px-6 py-3">{m.likeCount}</td>
                  <td className="px-6 py-3">{m.commentsCount}</td>
                  <td className="px-6 py-3">{m.insights?.reach ?? "—"}</td>
                  <td className="px-6 py-3">{m.insights?.impressions ?? "—"}</td>
                  <td className="px-6 py-3">
                    {m.permalink ? (
                      <a className="text-primary hover:underline" href={m.permalink} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {media.items.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-cGrey" colSpan={7}>
                    No media yet. Click “Sync now”.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-xs text-cGrey">
        Need to reconnect? <Link className="text-primary hover:underline" href="/creator/login">Go to creator login</Link>
      </div>
    </div>
  );
}
