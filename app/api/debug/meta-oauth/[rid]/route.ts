import { NextResponse } from "next/server";
import { getMetaOAuthDiagnostics } from "@/lib/instagram/oauthDebugStore";

export async function GET(_: Request, ctx: { params: Promise<{ rid: string }> }) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { rid } = await ctx.params;
  const data = getMetaOAuthDiagnostics(rid);
  if (!data) return NextResponse.json({ error: "No diagnostics for this request id." }, { status: 404 });
  return NextResponse.json(data);
}

