"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SyncButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await fetch("/api/instagram/sync", { method: "POST" });
            const json = await res.json();
            if (!res.ok) return setError(json?.error ?? "Sync failed.");
            router.refresh();
          })
        }
        type="button"
      >
        {isPending ? "Syncing..." : "Sync now"}
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}
