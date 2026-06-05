import { describe, expect, it } from "vitest";
import { enabledCharacters, characterById } from "@/data/characters";

describe("Thai content", () => {
  it("has a near-complete mixed consonant and vowel dataset with stable IDs", () => {
    expect(enabledCharacters.filter((c) => c.type === "consonant")).toHaveLength(44);
    expect(enabledCharacters.filter((c) => c.type === "vowel").length).toBeGreaterThanOrEqual(25);
    expect(new Set(enabledCharacters.map((c) => c.id)).size).toBe(enabledCharacters.length);
    expect(enabledCharacters.slice(0, 4).map((c) => c.type)).toContain("vowel");
  });

  it("references valid comparison characters", () => {
    for (const character of enabledCharacters) {
      for (const comparison of [...character.visualSimilarities, ...character.soundSimilarities]) {
        expect(characterById.has(comparison.characterId)).toBe(true);
        expect(comparison.explanation.length).toBeGreaterThan(10);
      }
    }
  });
});
