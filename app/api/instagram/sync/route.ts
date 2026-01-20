import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InstagramAccount } from "@/lib/models/InstagramAccount";
import { syncInstagramAccount } from "@/lib/instagram/sync";

export async function POST() {
  const auth = await getAuth("creator");
  if (!auth?.user.instagramAccountId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  await connectToDatabase();

  const account = await InstagramAccount.findById(auth.user.instagramAccountId).select("+accessToken");
  if (!account?.accessToken) return NextResponse.json({ error: "Instagram not connected." }, { status: 400 });

  const result = await syncInstagramAccount(account._id.toString());
  return NextResponse.json({ ok: true, ...result });
}
