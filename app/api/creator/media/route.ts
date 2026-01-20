import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";
import { getCreatorMedia } from "@/lib/queries/creator";

export async function GET() {
  const auth = await getAuth("creator");
  if (!auth?.user.instagramAccountId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    return NextResponse.json(await getCreatorMedia(auth.user.instagramAccountId.toString()));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load." }, { status: 400 });
  }
}
