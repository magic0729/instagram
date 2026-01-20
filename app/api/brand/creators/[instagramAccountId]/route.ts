import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";
import { getCreatorDetail } from "@/lib/queries/brand";

export async function GET(_: Request, ctx: { params: Promise<{ instagramAccountId: string }> }) {
  const auth = await getAuth("brand");
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { instagramAccountId } = await ctx.params;
  if (!instagramAccountId) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  try {
    return NextResponse.json(await getCreatorDetail(instagramAccountId));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not found.";
    const status = msg === "Not found." ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
