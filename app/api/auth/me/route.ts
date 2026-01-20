import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: auth.user._id.toString(),
      role: auth.user.role,
      email: auth.user.email ?? null,
      instagramAccountId: auth.user.instagramAccountId?.toString?.() ?? null,
    },
  });
}

