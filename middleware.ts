import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "thai_app_session";
const LOCAL_AUTH_SECRET = "local-development-secret-change-me";

function authEnabled(): boolean {
  return process.env.THAI_APP_AUTH_ENABLED !== "false";
}

function configError(): boolean {
  if (!authEnabled() || process.env.NODE_ENV !== "production") return false;
  if (!process.env.THAI_APP_PASSWORD) return true;
  if (!process.env.THAI_APP_AUTH_SECRET) return true;
  return process.env.THAI_APP_AUTH_SECRET === LOCAL_AUTH_SECRET;
}

async function verify(value: string | undefined): Promise<boolean> {
  if (!authEnabled()) return true;
  if (configError()) return false;
  if (!value) return false;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return false;
  const secret = process.env.THAI_APP_AUTH_SECRET ?? LOCAL_AUTH_SECRET;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const raw = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded));
  const expected = btoa(String.fromCharCode(...new Uint8Array(raw))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (expected !== signature) return false;
  try {
    const payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/"))) as { authenticated: boolean; exp: number };
    return payload.authenticated === true && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/_next") || pathname === "/favicon.ico") return NextResponse.next();
  const ok = await verify(request.cookies.get(AUTH_COOKIE)?.value);
  if (!ok) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    if (configError()) loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
