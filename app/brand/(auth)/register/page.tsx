"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function BrandRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <AuthShell title="Admin access" subtitle="Create an admin account for brands." variant="admin">
      <h1 className="text-2xl font-semibold tracking-tight text-cblack">Create admin account</h1>
      <p className="mt-2 text-sm leading-6 text-secondary">Email + password authentication.</p>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            setError(null);
            const res = await fetch("/api/brand/auth/register", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json?.error ?? "Registration failed.");
            router.push("/brand/dashboard");
            router.refresh();
          });
        }}
      >
        <label className="block text-sm">
          <span className="text-zinc-700">Email</span>
          <input
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary/40"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-700">Password</span>
          <input
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary/40"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creating..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

