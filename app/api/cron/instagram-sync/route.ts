import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InstagramAccount } from "@/lib/models/InstagramAccount";
import { syncInstagramAccount } from "@/lib/instagram/sync";

export async function POST(req: Request) {
  const env = getEnv();
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 501 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 10) || 10, 50);

  await connectToDatabase();
  const accounts = await InstagramAccount.find({ isListed: true })
    .sort({ updatedAt: 1 })
    .limit(limit)
    .select({ _id: 1 });

  const results: Array<{ instagramAccountId: string; ok: boolean; error?: string }> = [];
  for (const a of accounts) {
    try {
      await syncInstagramAccount(a._id.toString());
      results.push({ instagramAccountId: a._id.toString(), ok: true });
    } catch (e) {
      results.push({
        instagramAccountId: a._id.toString(),
        ok: false,
        error: e instanceof Error ? e.message : "Sync failed.",
      });
    }
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}
