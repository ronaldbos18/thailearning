import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "thai_app_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type AuthPayload = { authenticated: true; exp: number };

export function authEnabled(): boolean {
  return process.env.THAI_APP_AUTH_ENABLED !== "false";
}

function secret(): string {
  return process.env.THAI_APP_AUTH_SECRET ?? "local-development-secret-change-me";
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionValue(now = Date.now()): string {
  const payload: AuthPayload = { authenticated: true, exp: now + MAX_AGE_SECONDS * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!authEnabled()) return true;
  if (!value) return false;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return false;
  const expected = sign(encoded);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as AuthPayload;
    return payload.authenticated === true && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAuth(): Promise<void> {
  if (!authEnabled()) return;
  const cookieStore = await cookies();
  if (!verifySessionValue(cookieStore.get(AUTH_COOKIE)?.value)) redirect("/login");
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export function passwordMatches(password: string): boolean {
  const configured = process.env.THAI_APP_PASSWORD;
  if (!configured) return process.env.NODE_ENV !== "production" && password === "local-dev";
  const left = Buffer.from(password);
  const right = Buffer.from(configured);
  return left.length === right.length && timingSafeEqual(left, right);
}
