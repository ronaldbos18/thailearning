import { afterEach, describe, expect, it } from "vitest";
import { createQuestionToken, questionTokenHash, verifyQuestionToken } from "@/lib/question-token";

const originalEnv = { ...process.env };
afterEach(() => { process.env = { ...originalEnv }; });

describe("issued question tokens", () => {
  it("binds submitted answers to server-issued character, font mode, source, and options", () => {
    process.env.THAI_APP_AUTH_ENABLED = "true";
    process.env.THAI_APP_PASSWORD = "secret";
    process.env.THAI_APP_AUTH_SECRET = "question-secret";
    const token = createQuestionToken({ characterId: "con_gor_gai", shownFontMode: "traditional", source: "due", optionIds: ["con_gor_gai", "con_ngor_ngu"] }, 1000);
    const payload = verifyQuestionToken(token, 1001);
    expect(payload?.characterId).toBe("con_gor_gai");
    expect(payload?.shownFontMode).toBe("traditional");
    expect(payload?.source).toBe("due");
    expect(payload?.optionIds).toContain("con_ngor_ngu");
  });

  it("rejects forged character/font/source payloads", () => {
    process.env.THAI_APP_AUTH_ENABLED = "true";
    process.env.THAI_APP_PASSWORD = "secret";
    process.env.THAI_APP_AUTH_SECRET = "question-secret";
    const token = createQuestionToken({ characterId: "con_gor_gai", shownFontMode: "traditional", source: "due", optionIds: ["con_gor_gai"] }, 1000);
    const [encoded, signature] = token.split(".");
    const forgedPayload = { ...JSON.parse(Buffer.from(encoded, "base64url").toString()), characterId: "con_ngor_ngu", shownFontMode: "modern", source: "rusty" };
    const forged = `${Buffer.from(JSON.stringify(forgedPayload)).toString("base64url")}.${signature}`;
    expect(verifyQuestionToken(forged, 1001)).toBeNull();
  });

  it("provides a stable replay-prevention hash", () => {
    const token = "payload.signature";
    expect(questionTokenHash(token)).toBe(questionTokenHash(token));
  });
});
