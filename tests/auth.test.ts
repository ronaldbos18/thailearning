import { afterEach, describe, expect, it } from "vitest";
import { authConfigError, createSessionValue, verifySessionValue } from "@/lib/auth-core";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("password-only auth sessions", () => {
  it("accepts signed unexpired session cookies and rejects tampering", () => {
    process.env.THAI_APP_AUTH_ENABLED = "true";
    process.env.THAI_APP_PASSWORD = "secret";
    process.env.THAI_APP_AUTH_SECRET = "test-secret";
    const session = createSessionValue(Date.now());
    expect(verifySessionValue(session)).toBe(true);
    expect(verifySessionValue(`${session}tampered`)).toBe(false);
  });

  it("fails closed in production when auth configuration is missing", () => {
    process.env.NODE_ENV = "production";
    process.env.THAI_APP_AUTH_ENABLED = "true";
    delete process.env.THAI_APP_PASSWORD;
    delete process.env.THAI_APP_AUTH_SECRET;
    expect(authConfigError()).toMatch(/THAI_APP_PASSWORD/);
    expect(verifySessionValue(undefined)).toBe(false);
  });

  it("rejects the local fallback secret in production", () => {
    process.env.NODE_ENV = "production";
    process.env.THAI_APP_AUTH_ENABLED = "true";
    process.env.THAI_APP_PASSWORD = "secret";
    process.env.THAI_APP_AUTH_SECRET = "local-development-secret-change-me";
    expect(authConfigError()).toMatch(/fallback/);
  });
});
