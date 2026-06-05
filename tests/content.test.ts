import { describe, expect, it } from "vitest";
import { enabledCharacters, characterById } from "@/data/characters";
import { comparisonExplanations, soundGroups, visualGroups } from "@/data/characters/confusing-groups";
import { learningOrder } from "@/data/characters/learning-order";

const placeholderPatterns = [
  /Missing (visual|sound) comparison explanation/,
  /neighbouring Thai shapes/,
  /rough Phase 1 sound family/,
  /check the exact loops/,
  /romanised names .* separate/,
  /Compare the concrete/,
  /romanised clue is close/
];

function orderedPairKey(kind: "visual" | "sound", a: string, b: string) {
  return comparisonExplanations[`${kind}:${a}:${b}`] ? `${kind}:${a}:${b}` : `${kind}:${b}:${a}`;
}

describe("Thai content", () => {
  it("has complete Phase 1 consonant and vowel coverage with stable IDs", () => {
    const consonants = enabledCharacters.filter((c) => c.type === "consonant");
    const vowels = enabledCharacters.filter((c) => c.type === "vowel");

    expect(consonants).toHaveLength(44);
    expect(vowels).toHaveLength(33);
    expect(new Set(enabledCharacters.map((c) => c.id)).size).toBe(enabledCharacters.length);
    expect(enabledCharacters.every((c) => c.thaiTraditional && c.thaiModern && c.romanisedName && c.roughSound && c.mnemonic)).toBe(true);
    expect(enabledCharacters.find((c) => c.id === "con_kor_khuat")?.mnemonic).toMatch(/obsolete/i);
    expect(enabledCharacters.find((c) => c.id === "con_kor_khon")?.mnemonic).toMatch(/obsolete/i);
  });

  it("uses a complete, unique learning order that mixes early consonants and vowels", () => {
    expect(learningOrder).toHaveLength(enabledCharacters.length);
    expect(new Set(learningOrder).size).toBe(learningOrder.length);
    expect(new Set(learningOrder)).toEqual(new Set(enabledCharacters.map((c) => c.id)));
    expect(enabledCharacters.map((c) => c.learningOrder)).toEqual([...enabledCharacters.map((c) => c.learningOrder)].sort((a, b) => a - b));

    for (const earlyBatch of [enabledCharacters.slice(0, 4), enabledCharacters.slice(4, 8), enabledCharacters.slice(8, 12), enabledCharacters.slice(12, 16)]) {
      expect(earlyBatch.map((c) => c.type)).toContain("consonant");
      expect(earlyBatch.map((c) => c.type)).toContain("vowel");
    }

    const earlyIds = new Set(enabledCharacters.slice(0, 16).map((c) => c.id));
    for (const confusingEarlyId of ["con_kor_khai", "con_kor_kwai", "con_chor_chang", "con_sor_so", "con_tor_tao"]) {
      expect(earlyIds.has(confusingEarlyId)).toBe(false);
    }
  });

  it("references valid comparison characters and has reciprocal comparison relationships", () => {
    for (const character of enabledCharacters) {
      for (const comparison of [...character.visualSimilarities, ...character.soundSimilarities]) {
        const other = characterById.get(comparison.characterId);
        expect(other, `${character.id} references ${comparison.characterId}`).toBeTruthy();
        expect(comparison.characterId).not.toBe(character.id);
        expect(comparison.explanation.length).toBeGreaterThan(35);
        expect(placeholderPatterns.some((pattern) => pattern.test(comparison.explanation))).toBe(false);

        const reciprocalComparisons = [...(other?.visualSimilarities ?? []), ...(other?.soundSimilarities ?? [])];
        expect(reciprocalComparisons.some((item) => item.characterId === character.id)).toBe(true);
      }
    }
  });

  it("has explicit non-placeholder explanations for every configured comparison pair", () => {
    for (const [kind, groups] of [["visual", visualGroups], ["sound", soundGroups]] as const) {
      for (const group of groups) {
        for (const id of group) expect(characterById.has(id)).toBe(true);
        expect(new Set(group).size).toBe(group.length);

        for (let i = 0; i < group.length; i += 1) {
          for (let j = i + 1; j < group.length; j += 1) {
            const key = orderedPairKey(kind, group[i], group[j]);
            expect(comparisonExplanations[key], key).toBeTruthy();
            expect(placeholderPatterns.some((pattern) => pattern.test(comparisonExplanations[key]))).toBe(false);
          }
        }
      }
    }
  });
});
