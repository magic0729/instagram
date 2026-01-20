import { AuthShell } from "@/components/AuthShell";

export default async function CreatorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; rid?: string }>;
}) {
  const { error, rid } = await searchParams;

  return (
    <AuthShell
      title="Creator analytics, simplified."
      subtitle="Connect your Instagram Business/Creator account to sync insights and track performance."
      variant="default"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-cblack">Creator login</h1>
      <p className="mt-2 text-sm leading-6 text-secondary">
        Connect your Instagram Business/Creator account via Meta OAuth to unlock analytics.
      </p>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div>{decodeURIComponent(error)}</div>
          {rid ? <div className="mt-1 text-xs text-red-600">Request id: {rid}</div> : null}
        </div>
      ) : null}

      <a
        href="/api/auth/instagram/start"
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Continue with Instagram
      </a>

      <p className="mt-4 text-xs text-cGrey">
        Note: Meta uses Facebook permissions to access Instagram Business/Creator analytics.
      </p>
    </AuthShell>
  );
}
