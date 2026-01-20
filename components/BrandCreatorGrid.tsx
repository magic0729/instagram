"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BrandCreatorCard = {
  instagramAccountId: string;
  username: string;
  followersCount: number;
  mediaCount: number;
  accountType: string | null;
  lastSyncedAt: string | Date;
  latestSnapshot: null | { date: string; followersCount: number; engagementRate: number };
};

export function BrandCreatorGrid({ creators }: { creators: BrandCreatorCard[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter((c) => c.username.toLowerCase().includes(q));
  }, [creators, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-secondary">Search creators</label>
          <input
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary/40"
            placeholder="@username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="text-xs text-cGrey">{filtered.length} creators</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c.instagramAccountId}
            href={`/brand/creators/${c.instagramAccountId}`}
            className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[var(--shadow-soft)] hover:border-primary/30"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-cblack">@{c.username}</div>
              <div className="text-xs text-cGrey">{c.accountType ?? "IG"}</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-secondary">
              <div>
                <div className="text-cGrey">Followers</div>
                <div className="mt-1 text-sm font-semibold text-cblack">{c.followersCount}</div>
              </div>
              <div>
                <div className="text-cGrey">Media</div>
                <div className="mt-1 text-sm font-semibold text-cblack">{c.mediaCount}</div>
              </div>
              <div>
                <div className="text-cGrey">ER</div>
                <div className="mt-1 text-sm font-semibold text-cblack">
                  {c.latestSnapshot ? `${c.latestSnapshot.engagementRate.toFixed(2)}%` : "—"}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-cGrey">
              Last sync: {c.lastSyncedAt ? new Date(c.lastSyncedAt).toLocaleString() : "—"}
            </div>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-secondary shadow-[var(--shadow-soft)] sm:col-span-2 lg:col-span-3">
            No creators match your search.
          </div>
        ) : null}
      </div>
    </div>
  );
}
