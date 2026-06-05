import { describe, expect, it } from "vitest";
import { enabledCharacters, getCharacterOrThrow } from "@/data/characters";
import { buildDistractors, comparisonFeedback, createQuestion, nextLearningBatch, nonRareIntroductionRequirement, rareContentUnlocked, selectNextCharacter } from "@/lib/practice-engine";
import { emptyProgress, type AnswerHistory, type CharacterProgress } from "@/lib/progress";

const now = new Date("2026-06-05T09:00:00.000Z");

function answer(characterId: string, selectedCharacterId: string, isCorrect: boolean, responseSequence: number): AnswerHistory {
  return { characterId, selectedCharacterId, isCorrect, responseSequence, shownFontMode: "traditional", questionSource: "review", answeredAt: now.toISOString(), xpAwarded: isCorrect ? 10 : 0 };
}

function introducedProgress(characterId: string, masteryLevel = 5): CharacterProgress {
  return { ...emptyProgress(characterId), firstSeenAt: now.toISOString(), masteryLevel };
}

function nonRareCharacters() {
  return enabledCharacters.filter((character) => character.contentFrequency !== "rare");
}

function rareCharacters() {
  return enabledCharacters.filter((character) => character.contentFrequency === "rare");
}

describe("practice engine", () => {
  it("returns the next learning batch before practice", () => {
    const batch = nextLearningBatch([], 4);
    expect(batch).toHaveLength(4);
    expect(batch.map((item) => item.id)).toEqual(["con_gor_gai", "con_ngor_ngu", "vow_sara_aa", "vow_sara_i"]);
  });

  it("gates rare automatic learning until enough non-rare characters are introduced", () => {
    const requirement = nonRareIntroductionRequirement();
    const rareIds = rareCharacters().map((character) => character.id);
    expect(rareIds.length).toBeGreaterThan(0);

    const justBeforeThreshold = nonRareCharacters().slice(0, Math.max(0, requirement - 1)).map((character) => introducedProgress(character.id));
    expect(rareContentUnlocked(justBeforeThreshold)).toBe(false);
    expect(nextLearningBatch(justBeforeThreshold, 5).some((character) => character.contentFrequency === "rare")).toBe(false);

    const atThreshold = nonRareCharacters().slice(0, requirement).map((character) => introducedProgress(character.id));
    expect(rareContentUnlocked(atThreshold)).toBe(true);
  });

  it("preserves learning order while allowing rare characters after all earlier non-rare items", () => {
    const progress = nonRareCharacters().map((character) => introducedProgress(character.id));
    const batch = nextLearningBatch(progress, 5);
    expect(batch.length).toBeGreaterThan(0);
    expect(batch.every((character) => character.contentFrequency === "rare")).toBe(true);
    expect(batch.map((character) => character.learningOrder)).toEqual([...batch.map((character) => character.learningOrder)].sort((a, b) => a - b));
  });

  it("lets introduced rare characters participate normally in practice", () => {
    const rare = rareCharacters()[0];
    const progress = [introducedProgress(rare.id, 1)];
    const question = createQuestion({ progress, history: [], now, allowNew: false, rng: () => 0.5 });

    expect(question.character.id).toBe(rare.id);
    expect(question.source).toBe("recent");
    expect(question.options.some((option) => option.id === rare.id)).toBe(true);
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

  it("uses the latest repeated mistake when scheduling immediate retries", () => {
    const progress = ["con_gor_gai", "con_ngor_ngu", "vow_sara_aa", "vow_sara_i"].map((id) => ({ ...emptyProgress(id), firstSeenAt: now.toISOString(), masteryLevel: 1 }));
    const history = [
      answer("con_gor_gai", "con_ngor_ngu", false, 1),
      answer("con_ngor_ngu", "con_ngor_ngu", true, 2),
      answer("vow_sara_aa", "vow_sara_aa", true, 3),
      answer("con_gor_gai", "con_ngor_ngu", false, 4),
      answer("con_ngor_ngu", "con_ngor_ngu", true, 5),
      answer("vow_sara_i", "vow_sara_i", true, 6)
    ];
    expect(selectNextCharacter({ progress, history, now }).source).toBe("immediate_retry");
    expect(selectNextCharacter({ progress, history, now }).character.id).toBe("con_gor_gai");
  });

  it("rotates eligible review characters instead of always picking the first", () => {
    const progress = ["con_gor_gai", "con_ngor_ngu", "vow_sara_aa"].map((id) => ({ ...emptyProgress(id), firstSeenAt: now.toISOString(), masteryLevel: 4 }));
    const history = [answer("con_gor_gai", "con_gor_gai", true, 1), answer("con_ngor_ngu", "con_ngor_ngu", true, 2)];
    expect(selectNextCharacter({ progress, history, now, rng: () => 0.5 }).character.id).toBe("vow_sara_aa");
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
