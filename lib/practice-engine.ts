import { enabledCharacters, getCharacterOrThrow } from "@/data/characters";
import type { FontMode, ThaiCharacter } from "@/data/characters/types";
import type { AnswerHistory, CharacterProgress } from "./progress";
import { confidenceFor, emptyProgress } from "./progress";

export type QuestionSource = "immediate_retry" | "rusty" | "overdue" | "due" | "recent" | "review" | "new";
export type RandomSource = () => number;

export type PracticeQuestion = {
  character: ThaiCharacter;
  shownFontMode: FontMode;
  source: QuestionSource;
  options: ThaiCharacter[];
};

const MAX_ACTIVE_UNMASTERED = 20;
const MAX_REVIEW_BACKLOG = 8;

function progressFor(progress: CharacterProgress[], characterId: string): CharacterProgress {
  return progress.find((item) => item.characterId === characterId) ?? emptyProgress(characterId);
}

function lastSeenSequence(history: AnswerHistory[], characterId: string): number {
  return [...history].reverse().find((answer) => answer.characterId === characterId)?.responseSequence ?? 0;
}

function rotateByHistory<T extends { id: string }>(items: T[], history: AnswerHistory[], rng: RandomSource = Math.random): T[] {
  return [...items].sort((a, b) => {
    const bySeen = lastSeenSequence(history, a.id) - lastSeenSequence(history, b.id);
    if (bySeen !== 0) return bySeen;
    return rng() - 0.5;
  });
}

export function introducedIds(progress: CharacterProgress[]): Set<string> {
  return new Set(progress.filter((item) => item.firstSeenAt || item.masteryLevel > 0 || item.totalAttempts > 0).map((item) => item.characterId));
}

export function reviewBacklog(progress: CharacterProgress[], now = new Date()): number {
  return progress.filter((item) => ["due", "rusty"].includes(confidenceFor(item, now))).length;
}

export function canIntroduceNewBatch(progress: CharacterProgress[], now = new Date()): boolean {
  const activeUnmastered = progress.filter((item) => item.masteryLevel > 0 && item.masteryLevel < 5).length;
  return activeUnmastered < MAX_ACTIVE_UNMASTERED && reviewBacklog(progress, now) <= MAX_REVIEW_BACKLOG;
}

export function nextLearningBatch(progress: CharacterProgress[], batchSize = 4, now = new Date()): ThaiCharacter[] {
  if (!canIntroduceNewBatch(progress, now)) return [];
  const introduced = introducedIds(progress);
  return enabledCharacters.filter((character) => !introduced.has(character.id)).slice(0, Math.min(batchSize, 5));
}

export function expectedLearningBatchIds(progress: CharacterProgress[], batchSize = 4, now = new Date()): string[] {
  return nextLearningBatch(progress, batchSize, now).map((character) => character.id);
}

export function chooseFontMode(progress: CharacterProgress): FontMode {
  if (progress.traditionalCorrectCount === 0) return "traditional";
  if (progress.modernCorrectCount === 0) return "modern";
  return progress.totalAttempts % 3 === 0 ? "both" : progress.totalAttempts % 2 === 0 ? "modern" : "traditional";
}

function immediateRetryId(history: AnswerHistory[]): string | null {
  const sorted = [...history].sort((a, b) => a.responseSequence - b.responseSequence);
  const ids = Array.from(new Set(sorted.map((answer) => answer.characterId))).sort((a, b) => {
    const aLast = [...sorted].reverse().find((answer) => answer.characterId === a && !answer.isCorrect)?.responseSequence ?? 0;
    const bLast = [...sorted].reverse().find((answer) => answer.characterId === b && !answer.isCorrect)?.responseSequence ?? 0;
    return bLast - aLast;
  });
  for (const id of ids) {
    const lastForCharacter = [...sorted].reverse().find((answer) => answer.characterId === id);
    if (!lastForCharacter || lastForCharacter.isCorrect) continue;
    const intervening = sorted.filter((answer) => answer.responseSequence > lastForCharacter.responseSequence && answer.characterId !== id).length;
    if (intervening >= 2 && intervening <= 4) return id;
  }
  return null;
}

function pickEligible(input: { candidates: ThaiCharacter[]; history: AnswerHistory[]; rng?: RandomSource }): ThaiCharacter | null {
  if (input.candidates.length === 0) return null;
  return rotateByHistory(input.candidates, input.history, input.rng)[0];
}

export function selectNextCharacter(input: {
  progress: CharacterProgress[];
  history: AnswerHistory[];
  now?: Date;
  allowNew?: boolean;
  rng?: RandomSource;
}): { character: ThaiCharacter; source: QuestionSource } {
  const now = input.now ?? new Date();
  const introduced = introducedIds(input.progress);
  const retry = immediateRetryId(input.history);
  if (retry) return { character: getCharacterOrThrow(retry), source: "immediate_retry" };

  const known = enabledCharacters.filter((character) => introduced.has(character.id));
  const byDue = known.map((character) => ({ character, progress: progressFor(input.progress, character.id), confidence: confidenceFor(progressFor(input.progress, character.id), now) }));
  const rusty = pickEligible({ candidates: byDue.filter((item) => item.confidence === "rusty").map((item) => item.character), history: input.history, rng: input.rng });
  if (rusty) return { character: rusty, source: "rusty" };
  const overdue = pickEligible({ candidates: byDue.filter((item) => item.progress.nextReviewAt && new Date(item.progress.nextReviewAt).getTime() < now.getTime() - 36e5).map((item) => item.character), history: input.history, rng: input.rng });
  if (overdue) return { character: overdue, source: "overdue" };
  const due = pickEligible({ candidates: byDue.filter((item) => item.confidence === "due").map((item) => item.character), history: input.history, rng: input.rng });
  if (due) return { character: due, source: "due" };

  const introducedCount = known.length;
  const recentTarget = introducedCount < 15 ? 0.4 : 0.2;
  const recentAttempts = input.history.slice(-10).filter((answer) => progressFor(input.progress, answer.characterId).masteryLevel <= 2).length;
  const preferRecent = input.history.length < 3 || recentAttempts / Math.max(1, Math.min(10, input.history.length)) < recentTarget;
  const recentCandidates = known.filter((character) => progressFor(input.progress, character.id).masteryLevel <= 2);
  if (preferRecent) {
    const recent = pickEligible({ candidates: recentCandidates, history: input.history, rng: input.rng });
    if (recent) return { character: recent, source: "recent" };
  }
  const review = pickEligible({ candidates: known.filter((character) => !recentCandidates.some((recent) => recent.id === character.id)), history: input.history, rng: input.rng }) ?? pickEligible({ candidates: known, history: input.history, rng: input.rng });
  if (review) return { character: review, source: "review" };
  if (input.allowNew !== false) return { character: nextLearningBatch(input.progress, 1, now)[0] ?? enabledCharacters[0], source: "new" };
  return { character: enabledCharacters[0], source: "review" };
}

export function buildDistractors(input: { correct: ThaiCharacter; progress: CharacterProgress[]; history: AnswerHistory[]; rng?: RandomSource }): ThaiCharacter[] {
  const correct = input.correct;
  const mastery = progressFor(input.progress, correct.id).masteryLevel;
  const confusedIds = [...correct.visualSimilarities, ...correct.soundSimilarities].map((item) => item.characterId);
  const mistakes = input.history.filter((answer) => answer.characterId === correct.id && answer.selectedCharacterId !== correct.id).map((answer) => answer.selectedCharacterId).reverse();
  const random = rotateByHistory(enabledCharacters.filter((character) => character.id !== correct.id), input.history, input.rng).map((character) => character.id);
  const preferred = mastery >= 3 ? [...confusedIds, ...mistakes] : [...mistakes, ...confusedIds.slice(0, 1)];
  const ids = [...preferred, ...random];
  const unique = Array.from(new Set(ids)).filter((id) => id !== correct.id);
  return unique.slice(0, 3).map(getCharacterOrThrow);
}

export function createQuestion(input: { progress: CharacterProgress[]; history: AnswerHistory[]; now?: Date; allowNew?: boolean; rng?: RandomSource }): PracticeQuestion {
  const selected = selectNextCharacter(input);
  const progress = progressFor(input.progress, selected.character.id);
  const distractors = buildDistractors({ correct: selected.character, progress: input.progress, history: input.history, rng: input.rng });
  return { character: selected.character, shownFontMode: chooseFontMode(progress), source: selected.source, options: [selected.character, ...distractors].sort((a, b) => a.id.localeCompare(b.id)) };
}

export function comparisonFeedback(correct: ThaiCharacter, selected: ThaiCharacter): string | null {
  const visual = correct.visualSimilarities.find((item) => item.characterId === selected.id);
  if (visual) return `Looks similar: ${visual.explanation}`;
  const sound = correct.soundSimilarities.find((item) => item.characterId === selected.id);
  if (sound) return `Sounds similar: ${sound.explanation}`;
  return null;
}
