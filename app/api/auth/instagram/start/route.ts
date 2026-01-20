import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildMetaOAuthUrl } from "@/lib/instagram/meta";

const IG_OAUTH_STATE_COOKIE = "ji_ig_oauth_state";

export async function GET() {
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(IG_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  return NextResponse.redirect(buildMetaOAuthUrl(state));
}
