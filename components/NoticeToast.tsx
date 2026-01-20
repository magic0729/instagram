"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function NoticeToast() {
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");
  const rid = searchParams.get("rid");
  const [dismissed, setDismissed] = useState(false);

  const open = !dismissed && notice === "needs_instagram";
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-cblack">Instagram not fully connected yet</div>
            <div className="mt-1 text-sm text-secondary">
              We couldn’t detect an Instagram Business account attached to any Facebook Page you manage. You can still
              access the dashboard, but analytics will be empty until the Page ↔ Instagram connection is completed.
            </div>
            {rid ? <div className="mt-2 text-xs text-cGrey">Request id: {rid}</div> : null}
          </div>
          <button
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-cblack hover:bg-zinc-50"
            onClick={() => setDismissed(true)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
