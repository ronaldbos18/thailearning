import { afterEach, describe, expect, it, vi } from "vitest";
import { authConfigError, createSessionValue, verifySessionValue } from "@/lib/auth-core";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("password-only auth sessions", () => {
  it("accepts signed unexpired session cookies and rejects tampering", () => {
    vi.stubEnv("THAI_APP_AUTH_ENABLED", "true");
    vi.stubEnv("THAI_APP_PASSWORD", "secret");
    vi.stubEnv("THAI_APP_AUTH_SECRET", "test-secret");
    const session = createSessionValue(Date.now());
    expect(verifySessionValue(session)).toBe(true);
    expect(verifySessionValue(`${session}tampered`)).toBe(false);
  });

  it("fails closed in production when auth configuration is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("THAI_APP_AUTH_ENABLED", "true");
    vi.stubEnv("THAI_APP_PASSWORD", "");
    vi.stubEnv("THAI_APP_AUTH_SECRET", "");
    expect(authConfigError()).toMatch(/THAI_APP_PASSWORD/);
    expect(verifySessionValue(undefined)).toBe(false);
  });

  it("rejects the local fallback secret in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("THAI_APP_AUTH_ENABLED", "true");
    vi.stubEnv("THAI_APP_PASSWORD", "secret");
    vi.stubEnv("THAI_APP_AUTH_SECRET", "local-development-secret-change-me");
    expect(authConfigError()).toMatch(/fallback/);
  });
});
