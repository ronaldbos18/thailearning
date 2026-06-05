import { describe, expect, it } from "vitest";
import { createSessionValue, verifySessionValue } from "@/lib/auth";

describe("password-only auth sessions", () => {
  it("accepts signed unexpired session cookies and rejects tampering", () => {
    const session = createSessionValue(Date.now());
    expect(verifySessionValue(session)).toBe(true);
    expect(verifySessionValue(`${session}tampered`)).toBe(false);
  });
});
