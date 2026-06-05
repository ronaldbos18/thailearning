import { describe, expect, it } from "vitest";
import { getCharacterOrThrow } from "@/data/characters";
import { buildDistractors, comparisonFeedback, createQuestion, nextLearningBatch, selectNextCharacter } from "@/lib/practice-engine";
import { emptyProgress, type AnswerHistory } from "@/lib/progress";

const now = new Date("2026-06-05T09:00:00.000Z");

function answer(characterId: string, selectedCharacterId: string, isCorrect: boolean, responseSequence: number): AnswerHistory {
  return { characterId, selectedCharacterId, isCorrect, responseSequence, shownFontMode: "traditional", questionSource: "review", answeredAt: now.toISOString(), xpAwarded: isCorrect ? 10 : 0 };
}

describe("practice engine", () => {
  it("returns the next learning batch before practice", () => {
    const batch = nextLearningBatch([], 4);
    expect(batch).toHaveLength(4);
    expect(batch.map((item) => item.id)).toEqual(["con_gor_gai", "con_ngor_ngu", "vow_sara_aa", "vow_sara_i"]);
  });

  it("builds unique distractors without the correct answer", () => {
    const correct = getCharacterOrThrow("con_kor_khai");
    const distractors = buildDistractors({ correct, progress: [], history: [] });
    expect(distractors).toHaveLength(3);
    expect(new Set(distractors.map((item) => item.id)).size).toBe(3);
    expect(distractors.map((item) => item.id)).not.toContain(correct.id);
  });

  it("prioritises immediate retries after 2-4 intervening answers", () => {
    const progress = ["con_gor_gai", "con_ngor_ngu", "vow_sara_aa"].map((id) => ({ ...emptyProgress(id), firstSeenAt: now.toISOString(), masteryLevel: 1 }));
    const history = [answer("con_gor_gai", "con_ngor_ngu", false, 1), answer("con_ngor_ngu", "con_ngor_ngu", true, 2), answer("vow_sara_aa", "vow_sara_aa", true, 3)];
    expect(selectNextCharacter({ progress, history, now }).source).toBe("immediate_retry");
  });

  it("creates Thai-to-English multiple choice questions only", () => {
    const question = createQuestion({ progress: [], history: [], now });
    expect(question.options).toHaveLength(4);
    expect(question.options.find((option) => option.id === question.character.id)).toBeTruthy();
    expect(["traditional", "modern", "both"]).toContain(question.shownFontMode);
  });

  it("explains confusing wrong answers", () => {
    const correct = getCharacterOrThrow("con_kor_khai");
    const selected = getCharacterOrThrow("con_kor_kwai");
    expect(comparisonFeedback(correct, selected)).toMatch(/similar/i);
  });
});
