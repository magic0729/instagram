"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push(redirectTo);
          router.refresh();
        })
      }
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}

