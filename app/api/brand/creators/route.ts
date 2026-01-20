import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";
import { getListedCreators } from "@/lib/queries/brand";

export async function GET() {
  const auth = await getAuth("brand");
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return NextResponse.json(await getListedCreators());
}
