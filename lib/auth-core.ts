import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "thai_app_session";
export const LOCAL_AUTH_SECRET = "local-development-secret-change-me";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type AuthPayload = { authenticated: true; exp: number };

export function authEnabled(): boolean {
  return process.env.THAI_APP_AUTH_ENABLED !== "false";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function authConfigError(): string | null {
  if (!authEnabled() || !isProduction()) return null;
  if (!process.env.THAI_APP_PASSWORD) return "THAI_APP_PASSWORD is required when auth is enabled in production";
  if (!process.env.THAI_APP_AUTH_SECRET) return "THAI_APP_AUTH_SECRET is required when auth is enabled in production";
  if (process.env.THAI_APP_AUTH_SECRET === LOCAL_AUTH_SECRET) return "THAI_APP_AUTH_SECRET must not use the local-development fallback in production";
  return null;
}

export function authSecret(): string {
  const error = authConfigError();
  if (error) throw new Error(error);
  return process.env.THAI_APP_AUTH_SECRET ?? LOCAL_AUTH_SECRET;
}

export function configuredPassword(): string | null {
  if (process.env.THAI_APP_PASSWORD) return process.env.THAI_APP_PASSWORD;
  return !isProduction() ? "local-dev" : null;
}

export function signValue(data: string, secret = authSecret()): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function safeEqual(leftValue: string, rightValue: string): boolean {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionValue(now = Date.now()): string {
  const payload: AuthPayload = { authenticated: true, exp: now + MAX_AGE_SECONDS * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signValue(encoded)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!authEnabled()) return true;
  if (authConfigError()) return false;
  if (!value) return false;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return false;
  const expected = signValue(encoded);
  if (!safeEqual(signature, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as AuthPayload;
    return payload.authenticated === true && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function passwordMatches(password: string): boolean {
  if (!authEnabled()) return true;
  if (authConfigError()) return false;
  const configured = configuredPassword();
  if (configured === null) return false;
  return safeEqual(password, configured);
}
