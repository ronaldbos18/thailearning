import { consonants } from "./consonants";
import { comparisonExplanations, visualGroups, soundGroups } from "./confusing-groups";
import { learningOrder } from "./learning-order";
import type { CharacterComparison, ThaiCharacter } from "./types";
import { vowels } from "./vowels";

function explanationFor(kind: "visual" | "sound", id: string, other: string): string {
  return (
    comparisonExplanations[`${kind}:${id}:${other}`] ??
    comparisonExplanations[`${kind}:${other}:${id}`] ??
    `Missing ${kind} comparison explanation for ${id} and ${other}.`
  );
}

function comparisonsFor(id: string, groups: string[], kind: "visual" | "sound"): CharacterComparison[] {
  return Array.from(new Set(groups))
    .filter((other) => other !== id)
    .map((other) => ({ characterId: other, explanation: explanationFor(kind, id, other) }));
}

function addGroup(map: Map<string, string[]>, group: string[]): void {
  for (const id of group) map.set(id, [...(map.get(id) ?? []), ...group.filter((other) => other !== id)]);
}


const orderIndex = new Map(learningOrder.map((id, index) => [id, index + 1]));
const visualMap = new Map<string, string[]>();
const soundMap = new Map<string, string[]>();
for (const group of visualGroups) addGroup(visualMap, group);
for (const group of soundGroups) addGroup(soundMap, group);

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
