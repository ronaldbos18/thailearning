import { enabledCharacters, getCharacterOrThrow } from "@/data/characters";
import type { FontMode, ThaiCharacter } from "@/data/characters/types";
import type { AnswerHistory, CharacterProgress } from "./progress";
import { confidenceFor, emptyProgress } from "./progress";

export type QuestionSource = "immediate_retry" | "rusty" | "overdue" | "due" | "recent" | "review" | "new";

export type PracticeQuestion = {
  character: ThaiCharacter;
  shownFontMode: FontMode;
  source: QuestionSource;
  options: ThaiCharacter[];
};

function progressFor(progress: CharacterProgress[], characterId: string): CharacterProgress {
  return progress.find((item) => item.characterId === characterId) ?? emptyProgress(characterId);
}

function stablePick<T>(items: T[], count: number): T[] {
  return items.slice(0, count);
}

export function introducedIds(progress: CharacterProgress[]): Set<string> {
  return new Set(progress.filter((item) => item.firstSeenAt || item.masteryLevel > 0 || item.totalAttempts > 0).map((item) => item.characterId));
}

export function nextLearningBatch(progress: CharacterProgress[], batchSize = 4): ThaiCharacter[] {
  const introduced = introducedIds(progress);
  return enabledCharacters.filter((character) => !introduced.has(character.id)).slice(0, batchSize);
}

export function chooseFontMode(progress: CharacterProgress): FontMode {
  if (progress.traditionalCorrectCount === 0) return "traditional";
  if (progress.modernCorrectCount === 0) return "modern";
  return progress.totalAttempts % 3 === 0 ? "both" : progress.totalAttempts % 2 === 0 ? "modern" : "traditional";
}

export function selectNextCharacter(input: {
  progress: CharacterProgress[];
  history: AnswerHistory[];
  now?: Date;
  allowNew?: boolean;
}): { character: ThaiCharacter; source: QuestionSource } {
  const now = input.now ?? new Date();
  const introduced = introducedIds(input.progress);
  const recentWrong = input.history
    .filter((answer) => !answer.isCorrect)
    .slice(-8)
    .reverse()
    .map((answer) => answer.characterId);
  const retry = recentWrong.find((id) => {
    const since = input.history.slice(input.history.findIndex((h) => h.characterId === id && !h.isCorrect) + 1).length;
    return since >= 2 && since <= 4;
  });
  if (retry) return { character: getCharacterOrThrow(retry), source: "immediate_retry" };

  const known = enabledCharacters.filter((character) => introduced.has(character.id));
  const byDue = known.map((character) => ({ character, progress: progressFor(input.progress, character.id) }));
  const rusty = byDue.find((item) => confidenceFor(item.progress, now) === "rusty");
  if (rusty) return { character: rusty.character, source: "rusty" };
  const overdue = byDue.find((item) => item.progress.nextReviewAt && new Date(item.progress.nextReviewAt).getTime() < now.getTime() - 36e5);
  if (overdue) return { character: overdue.character, source: "overdue" };
  const due = byDue.find((item) => confidenceFor(item.progress, now) === "due");
  if (due) return { character: due.character, source: "due" };
  const recent = known.find((character) => progressFor(input.progress, character.id).masteryLevel <= 2);
  if (recent) return { character: recent, source: "recent" };
  const review = known[0];
  if (review) return { character: review, source: "review" };
  if (input.allowNew !== false) return { character: nextLearningBatch(input.progress, 1)[0], source: "new" };
  return { character: enabledCharacters[0], source: "review" };
}

export function buildDistractors(input: {
  correct: ThaiCharacter;
  progress: CharacterProgress[];
  history: AnswerHistory[];
}): ThaiCharacter[] {
  const correct = input.correct;
  const mastery = progressFor(input.progress, correct.id).masteryLevel;
  const confusedIds = [...correct.visualSimilarities, ...correct.soundSimilarities].map((item) => item.characterId);
  const mistakes = input.history
    .filter((answer) => answer.characterId === correct.id && answer.selectedCharacterId !== correct.id)
    .map((answer) => answer.selectedCharacterId)
    .reverse();
  const random = enabledCharacters.filter((character) => character.id !== correct.id);
  const preferred = mastery >= 3 ? [...confusedIds, ...mistakes] : [...mistakes, ...confusedIds.slice(0, 1)];
  const ids = [...preferred, ...random.map((character) => character.id)];
  const unique = Array.from(new Set(ids)).filter((id) => id !== correct.id);
  return stablePick(unique.map(getCharacterOrThrow), 3);
}

export function createQuestion(input: { progress: CharacterProgress[]; history: AnswerHistory[]; now?: Date; allowNew?: boolean }): PracticeQuestion {
  const selected = selectNextCharacter(input);
  const progress = progressFor(input.progress, selected.character.id);
  const distractors = buildDistractors({ correct: selected.character, progress: input.progress, history: input.history });
  return {
    character: selected.character,
    shownFontMode: chooseFontMode(progress),
    source: selected.source,
    options: [selected.character, ...distractors].sort((a, b) => a.id.localeCompare(b.id))
  };
}

export function comparisonFeedback(correct: ThaiCharacter, selected: ThaiCharacter): string | null {
  const visual = correct.visualSimilarities.find((item) => item.characterId === selected.id);
  if (visual) return `Looks similar: ${visual.explanation}`;
  const sound = correct.soundSimilarities.find((item) => item.characterId === selected.id);
  if (sound) return `Sounds similar: ${sound.explanation}`;
  return null;
}
