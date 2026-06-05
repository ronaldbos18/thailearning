import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, authConfigError, authEnabled, createSessionValue, passwordMatches, verifySessionValue } from "./auth-core";

export { AUTH_COOKIE, authConfigError, authEnabled, createSessionValue, passwordMatches, verifySessionValue };

export async function requireAuth(): Promise<void> {
  if (!authEnabled()) return;
  if (authConfigError()) redirect("/login?error=config");
  const cookieStore = await cookies();
  if (!verifySessionValue(cookieStore.get(AUTH_COOKIE)?.value)) redirect("/login");
}

export async function setAuthCookie(): Promise<void> {
  if (authConfigError()) redirect("/login?error=config");
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}
