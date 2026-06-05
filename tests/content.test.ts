import { describe, expect, it } from "vitest";
import { enabledCharacters, characterById } from "@/data/characters";
import { comparisonExplanations, soundGroups, visualGroups } from "@/data/characters/confusing-groups";
import { learningOrder } from "@/data/characters/learning-order";
import { nextLearningBatch } from "@/lib/practice-engine";

const placeholderPatterns = [
  /Missing (visual|sound) comparison explanation/,
  /neighbouring Thai shapes/,
  /rough Phase 1 sound family/,
  /check the exact loops/,
  /romanised names .* separate/,
  /Compare the concrete/,
  /romanised clue is close/
];
const standaloneVowelIds = new Set(["vow_ru", "vow_ruu", "vow_lu", "vow_luu"]);
const rareVowelIds = new Set(["vow_ruu", "vow_lu", "vow_luu"]);
const oldMnemonicRomanisationPattern = /(^|\s)(gor|kor|ngor|jor|chor|sor|yor|dor|tor|thor|nor|bor|por|phor|for|mor|ror|lor|wor|hor|or)(\s|-)/;

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
    expect(enabledCharacters.every((c) => !oldMnemonicRomanisationPattern.test(c.romanisedName))).toBe(true);
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

  it("classifies vowels and applies dotted-circle notation consistently", () => {
    const vowels = enabledCharacters.filter((c) => c.type === "vowel");

    for (const vowel of vowels) {
      if (standaloneVowelIds.has(vowel.id)) {
        expect(vowel.thaiTraditional.includes("◌"), vowel.id).toBe(false);
        expect(vowel.thaiModern.includes("◌"), vowel.id).toBe(false);
      } else {
        expect(vowel.thaiTraditional.includes("◌"), vowel.id).toBe(true);
        expect(vowel.thaiModern.includes("◌"), vowel.id).toBe(true);
      }
    }

    for (const rareVowelId of rareVowelIds) {
      const vowel = characterById.get(rareVowelId);
      expect(vowel?.type).toBe("vowel");
      expect(vowel?.contentFrequency).toBe("rare");
    }
    expect(characterById.get("vow_ru")?.contentFrequency).toBe("uncommon");
  });

  it("keeps rare vowels late and out of early learning batches", () => {
    const rareVowels = enabledCharacters.filter((c) => c.type === "vowel" && c.contentFrequency === "rare");
    expect(rareVowels.map((vowel) => vowel.id).sort()).toEqual([...rareVowelIds].sort());

    for (const rareVowel of rareVowels) {
      expect(rareVowel.learningOrder).toBeGreaterThan(enabledCharacters.length - 5);
    }

    expect(enabledCharacters.slice(0, 24).some((character) => character.contentFrequency === "rare")).toBe(false);
    expect(nextLearningBatch([], 5).some((character) => character.contentFrequency === "rare")).toBe(false);
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
