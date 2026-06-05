import type { ConfidenceState, FontMode } from "@/data/characters/types";

export type CharacterProgress = {
  characterId: string;
  masteryLevel: number;
  correctStreak: number;
  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  traditionalCorrectCount: number;
  modernCorrectCount: number;
  bothFontsCorrectCount: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastCorrectAt: string | null;
  lastIncorrectAt: string | null;
  nextReviewAt: string | null;
  confidenceState: ConfidenceState;
  masteredAt: string | null;
  updatedAt: string | null;
};

export type LearnerProfile = {
  id: string;
  totalXp: number;
  playerLevel: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastCompletedDay: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DailyActivity = {
  activityDate: string;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  newCharactersSeen: number;
  charactersMastered: number;
  rustyCharactersRecovered: number;
  xpEarned: number;
  dailyGoalCompleted: boolean;
};

export type AnswerHistory = {
  id?: string;
  characterId: string;
  shownFontMode: FontMode;
  selectedCharacterId: string;
  isCorrect: boolean;
  questionSource: string;
  responseSequence: number;
  answeredAt: string;
  xpAwarded: number;
};

export function emptyProgress(characterId: string): CharacterProgress {
  return {
    characterId,
    masteryLevel: 0,
    correctStreak: 0,
    totalAttempts: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    traditionalCorrectCount: 0,
    modernCorrectCount: 0,
    bothFontsCorrectCount: 0,
    firstSeenAt: null,
    lastSeenAt: null,
    lastCorrectAt: null,
    lastIncorrectAt: null,
    nextReviewAt: null,
    confidenceState: "new",
    masteredAt: null,
    updatedAt: null
  };
}

export function playerLevelForXp(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / 250) + 1);
}

export function confidenceFor(progress: CharacterProgress, now = new Date()): ConfidenceState {
  if (progress.masteryLevel === 0 || !progress.nextReviewAt) return progress.confidenceState;
  const dueAt = new Date(progress.nextReviewAt).getTime();
  const ageHours = (now.getTime() - dueAt) / 36e5;
  if (ageHours >= 48) return "rusty";
  if (ageHours >= 0) return "due";
  return "fresh";
}

export function nextReviewAt(level: number, now = new Date()): string {
  const intervalsHours: Record<number, number> = { 1: 1, 2: 24, 3: 72, 4: 168, 5: 336 };
  const next = new Date(now);
  next.setHours(next.getHours() + (intervalsHours[level] ?? 1));
  return next.toISOString();
}

export function applyAnswerProgress(input: {
  progress: CharacterProgress;
  isCorrect: boolean;
  shownFontMode: FontMode;
  now?: Date;
}): { progress: CharacterProgress; masteredNow: boolean; recoveredRusty: boolean; xpAwarded: number } {
  const now = input.now ?? new Date();
  const before = input.progress;
  const wasRusty = confidenceFor(before, now) === "rusty";
  const next = { ...before };
  const firstAttemptCorrect = input.isCorrect && before.totalAttempts === 0;
  let masteredNow = false;
  next.totalAttempts += 1;
  next.firstSeenAt ??= now.toISOString();
  next.lastSeenAt = now.toISOString();
  next.updatedAt = now.toISOString();

  if (input.isCorrect) {
    next.totalCorrect += 1;
    next.correctStreak += 1;
    next.lastCorrectAt = now.toISOString();
    if (input.shownFontMode === "traditional") next.traditionalCorrectCount += 1;
    if (input.shownFontMode === "modern") next.modernCorrectCount += 1;
    if (input.shownFontMode === "both") next.bothFontsCorrectCount += 1;
    const formReady = next.traditionalCorrectCount > 0 && next.modernCorrectCount > 0;
    const streakLevel = Math.min(4, Math.max(1, next.correctStreak));
    next.masteryLevel = Math.max(next.masteryLevel, streakLevel);
    if (next.correctStreak >= 5 && formReady && next.masteryLevel < 5) {
      next.masteryLevel = 5;
      next.masteredAt = now.toISOString();
      masteredNow = true;
    }
    next.confidenceState = "fresh";
    next.nextReviewAt = nextReviewAt(next.masteryLevel, now);
  } else {
    next.totalIncorrect += 1;
    next.correctStreak = 0;
    next.lastIncorrectAt = now.toISOString();
    next.masteryLevel = Math.max(next.masteryLevel, 1);
    next.confidenceState = "due";
    const retry = new Date(now);
    retry.setMinutes(retry.getMinutes() + 5);
    next.nextReviewAt = retry.toISOString();
  }

  const recoveredRusty = input.isCorrect && wasRusty;
  let xpAwarded = input.isCorrect ? 10 : 0;
  if (firstAttemptCorrect) xpAwarded += 5;
  if (recoveredRusty) xpAwarded += 20;
  if (masteredNow) xpAwarded += 100;
  return { progress: next, masteredNow, recoveredRusty, xpAwarded };
}
