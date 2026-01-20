import { redirect } from "next/navigation";
import { BrandCreatorGrid } from "@/components/BrandCreatorGrid";
import { getAuth } from "@/lib/auth/getAuth";
import { getListedCreators } from "@/lib/queries/brand";

export default async function BrandDashboardPage() {
  const auth = await getAuth("brand");
  if (!auth) redirect("/brand/login");

  const data = await getListedCreators();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-cblack">Creators</h1>
        <p className="mt-1 text-sm text-secondary">Browse creators and review their recent analytics.</p>
      </div>

      {data.creators.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-secondary shadow-[var(--shadow-soft)]">
          No creators available yet.
        </div>
      ) : (
        <BrandCreatorGrid creators={data.creators} />
      )}
    </div>
  );
}

