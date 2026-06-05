import { createHash, randomUUID } from "node:crypto";
import type { FontMode } from "@/data/characters/types";
import type { QuestionSource } from "./practice-engine";
import { authSecret, safeEqual, signValue } from "./auth-core";

export type QuestionTokenPayload = {
  nonce: string;
  characterId: string;
  shownFontMode: FontMode;
  source: QuestionSource;
  optionIds: string[];
  exp: number;
};

export function createQuestionToken(input: Omit<QuestionTokenPayload, "nonce" | "exp">, now = Date.now()): string {
  const payload: QuestionTokenPayload = { ...input, nonce: randomUUID(), exp: now + 5 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signValue(`question.${encoded}`, authSecret())}`;
}

export function verifyQuestionToken(token: string, now = Date.now()): QuestionTokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = signValue(`question.${encoded}`, authSecret());
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as QuestionTokenPayload;
    if (payload.exp < now) return null;
    if (!payload.characterId || !payload.shownFontMode || !payload.source || !Array.isArray(payload.optionIds)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function questionTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
