import { consonants } from "./consonants";
import { visualGroups, soundGroups } from "./confusing-groups";
import { learningOrder } from "./learning-order";
import type { CharacterComparison, ThaiCharacter } from "./types";
import { vowels } from "./vowels";

function comparisonsFor(id: string, groups: string[], kind: "visual" | "sound"): CharacterComparison[] {
  return groups
    .filter((other) => other !== id)
    .map((other) => ({
      characterId: other,
      explanation:
        kind === "visual"
          ? "Compare the stroke count, loop placement, and height before choosing."
          : "The romanised clue is close; use the Thai name and rough sound together."
    }));
}

const orderIndex = new Map(learningOrder.map((id, index) => [id, index + 1]));
const visualMap = new Map<string, string[]>();
const soundMap = new Map<string, string[]>();
for (const group of visualGroups) for (const id of group) visualMap.set(id, group);
for (const group of soundGroups) for (const id of group) soundMap.set(id, group);

export const thaiCharacters: ThaiCharacter[] = [...consonants, ...vowels]
  .map((character) => ({
    ...character,
    learningOrder: orderIndex.get(character.id) ?? character.learningOrder,
    visualSimilarities: comparisonsFor(character.id, visualMap.get(character.id) ?? [], "visual"),
    soundSimilarities: comparisonsFor(character.id, soundMap.get(character.id) ?? [], "sound")
  }))
  .sort((a, b) => a.learningOrder - b.learningOrder);

export const enabledCharacters = thaiCharacters.filter((character) => character.enabled);
export const characterById = new Map(enabledCharacters.map((character) => [character.id, character]));

export function getCharacterOrThrow(id: string): ThaiCharacter {
  const character = characterById.get(id);
  if (!character) throw new Error(`Unknown Thai character: ${id}`);
  return character;
}
