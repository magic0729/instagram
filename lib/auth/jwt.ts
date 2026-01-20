import jwt from "jsonwebtoken";
import { getEnv } from "@/lib/env";
import type { UserRole } from "@/lib/models/User";

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
};

export function signAuthToken(payload: AuthTokenPayload) {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const env = getEnv();
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
