import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/getAuth";
import { getCreatorDetail } from "@/lib/queries/brand";

export default async function BrandCreatorDetailPage({ params }: { params: { instagramAccountId: string } }) {
  const auth = await getAuth("brand");
  if (!auth) redirect("/brand/login");

  const data = await getCreatorDetail(params.instagramAccountId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/brand/dashboard" className="text-sm text-primary hover:underline">
            ← Back to creators
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-cblack">@{data.profile.username}</h1>
          <p className="mt-1 text-sm text-secondary">
            {data.profile.accountType ?? "Instagram"} • Followers {data.profile.followersCount} • Last sync{" "}
            {new Date(data.profile.lastSyncedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="text-sm text-secondary">Followers</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-cblack">{data.profile.followersCount}</div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="text-sm text-secondary">Media count</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-cblack">{data.profile.mediaCount}</div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="text-sm text-secondary">Latest ER</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-cblack">
            {data.snapshots[0] ? `${data.snapshots[0].engagementRate.toFixed(2)}%` : "—"}
          </div>
          <div className="mt-2 text-xs text-cGrey">{data.snapshots[0]?.date ?? ""}</div>
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
                <th className="px-6 py-3 font-medium">Impr.</th>
                <th className="px-6 py-3 font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.media.map((m) => (
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
              {data.media.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-cGrey" colSpan={7}>
                    No media synced yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

