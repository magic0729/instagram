import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User, type UserDoc, type UserRole } from "@/lib/models/User";

export type AuthContext = {
  user: UserDoc;
};

export async function getAuth(requiredRole?: UserRole): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  let payload: ReturnType<typeof verifyAuthToken>;
  try {
    payload = verifyAuthToken(token);
  } catch {
    return null;
  }

  if (requiredRole && payload.role !== requiredRole) return null;

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user) return null;

  if (requiredRole && user.role !== requiredRole) return null;
  return { user };
}
