import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthUser } from "../interfaces/http.js";

export function signAccessToken(user: AuthUser) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, permissions: user.permissions }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_MINUTES * 60
  });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 });
}

export function verifyRefreshToken(token: string) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof payload === "string" || typeof payload.sub !== "string") throw new Error("Refresh token invalido");
  return payload.sub;
}
