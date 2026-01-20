import { NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookie } from "@/lib/auth/cookies";
import { signAuthToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  await connectToDatabase();

  const email = parsed.data.email.toLowerCase();
  const existing = await User.findOne({ role: "brand", email });
  if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });

  const passwordHash = await hashPassword(parsed.data.password);
  const brand = await User.create({ role: "brand", email, passwordHash });

  await setAuthCookie(signAuthToken({ sub: brand._id.toString(), role: "brand" }));
  return NextResponse.json({ ok: true });
}
