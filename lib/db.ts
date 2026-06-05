import postgres from "postgres";
import { madridDateKey } from "./dates";
import { applyDailyGoal } from "./daily";
import type { AnswerHistory, CharacterProgress, DailyActivity, LearnerProfile } from "./progress";
import { emptyProgress, playerLevelForXp } from "./progress";

let client: ReturnType<typeof postgres> | null = null;

export function databaseConfigured(): boolean {
  return Boolean(process.env.THAI_APP_DATABASE_URL);
}

export function sql() {
  if (!process.env.THAI_APP_DATABASE_URL) throw new Error("THAI_APP_DATABASE_URL is not configured");
  client ??= postgres(process.env.THAI_APP_DATABASE_URL, { max: 3, ssl: "require" });
  return client;
}

export async function getProfile(): Promise<LearnerProfile> {
  if (!databaseConfigured()) return { id: "local", totalXp: 0, playerLevel: 1, currentStreakDays: 0, longestStreakDays: 0, lastCompletedDay: null };
  const rows = await sql()`
    insert into learner_profile (id) values ('solo')
    on conflict (id) do update set updated_at = now()
    returning id, total_xp, player_level, current_streak_days, longest_streak_days, last_completed_day
  `;
  const row = rows[0];
  return {
    id: row.id,
    totalXp: row.total_xp,
    playerLevel: row.player_level,
    currentStreakDays: row.current_streak_days,
    longestStreakDays: row.longest_streak_days,
    lastCompletedDay: row.last_completed_day
  };
}

export async function getCharacterProgress(): Promise<CharacterProgress[]> {
  if (!databaseConfigured()) return [];
  const rows = await sql()`select * from character_progress order by character_id`;
  return rows.map((row) => ({
    characterId: row.character_id,
    masteryLevel: row.mastery_level,
    correctStreak: row.correct_streak,
    totalAttempts: row.total_attempts,
    totalCorrect: row.total_correct,
    totalIncorrect: row.total_incorrect,
    traditionalCorrectCount: row.traditional_correct_count,
    modernCorrectCount: row.modern_correct_count,
    bothFontsCorrectCount: row.both_fonts_correct_count,
    firstSeenAt: row.first_seen_at?.toISOString?.() ?? row.first_seen_at,
    lastSeenAt: row.last_seen_at?.toISOString?.() ?? row.last_seen_at,
    lastCorrectAt: row.last_correct_at?.toISOString?.() ?? row.last_correct_at,
    lastIncorrectAt: row.last_incorrect_at?.toISOString?.() ?? row.last_incorrect_at,
    nextReviewAt: row.next_review_at?.toISOString?.() ?? row.next_review_at,
    confidenceState: row.confidence_state,
    masteredAt: row.mastered_at?.toISOString?.() ?? row.mastered_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at
  }));
}

export async function markCharactersIntroduced(characterIds: string[]): Promise<void> {
  if (!databaseConfigured() || characterIds.length === 0) return;
  for (const characterId of characterIds) {
    const progress = emptyProgress(characterId);
    await upsertCharacterProgress({ ...progress, masteryLevel: 1, firstSeenAt: new Date().toISOString(), confidenceState: "fresh" });
  }
}

export async function upsertCharacterProgress(progress: CharacterProgress): Promise<void> {
  if (!databaseConfigured()) return;
  await sql()`
    insert into character_progress (
      character_id, mastery_level, correct_streak, total_attempts, total_correct, total_incorrect,
      traditional_correct_count, modern_correct_count, both_fonts_correct_count, first_seen_at, last_seen_at,
      last_correct_at, last_incorrect_at, next_review_at, confidence_state, mastered_at, updated_at
    ) values (
      ${progress.characterId}, ${progress.masteryLevel}, ${progress.correctStreak}, ${progress.totalAttempts}, ${progress.totalCorrect}, ${progress.totalIncorrect},
      ${progress.traditionalCorrectCount}, ${progress.modernCorrectCount}, ${progress.bothFontsCorrectCount}, ${progress.firstSeenAt}, ${progress.lastSeenAt},
      ${progress.lastCorrectAt}, ${progress.lastIncorrectAt}, ${progress.nextReviewAt}, ${progress.confidenceState}, ${progress.masteredAt}, now()
    )
    on conflict (character_id) do update set
      mastery_level = excluded.mastery_level,
      correct_streak = excluded.correct_streak,
      total_attempts = excluded.total_attempts,
      total_correct = excluded.total_correct,
      total_incorrect = excluded.total_incorrect,
      traditional_correct_count = excluded.traditional_correct_count,
      modern_correct_count = excluded.modern_correct_count,
      both_fonts_correct_count = excluded.both_fonts_correct_count,
      first_seen_at = excluded.first_seen_at,
      last_seen_at = excluded.last_seen_at,
      last_correct_at = excluded.last_correct_at,
      last_incorrect_at = excluded.last_incorrect_at,
      next_review_at = excluded.next_review_at,
      confidence_state = excluded.confidence_state,
      mastered_at = excluded.mastered_at,
      updated_at = now()
  `;
}

export async function recentHistory(limit = 30): Promise<AnswerHistory[]> {
  if (!databaseConfigured()) return [];
  const rows = await sql()`select * from answer_history order by response_sequence desc limit ${limit}`;
  return rows.reverse().map((row) => ({
    id: row.id,
    characterId: row.character_id,
    shownFontMode: row.shown_font_mode,
    selectedCharacterId: row.selected_character_id,
    isCorrect: row.is_correct,
    questionSource: row.question_source,
    responseSequence: row.response_sequence,
    answeredAt: row.answered_at?.toISOString?.() ?? row.answered_at,
    xpAwarded: row.xp_awarded
  }));
}

export async function insertAnswer(answer: Omit<AnswerHistory, "responseSequence">): Promise<number> {
  if (!databaseConfigured()) return 0;
  const rows = await sql()`
    insert into answer_history (character_id, shown_font_mode, selected_character_id, is_correct, question_source, answered_at, xp_awarded)
    values (${answer.characterId}, ${answer.shownFontMode}, ${answer.selectedCharacterId}, ${answer.isCorrect}, ${answer.questionSource}, ${answer.answeredAt}, ${answer.xpAwarded})
    returning response_sequence
  `;
  return rows[0].response_sequence;
}

export async function getDailyActivity(dateKey = madridDateKey()): Promise<DailyActivity> {
  if (!databaseConfigured()) return { activityDate: dateKey, questionsAttempted: 0, correctAnswers: 0, incorrectAnswers: 0, newCharactersSeen: 0, charactersMastered: 0, rustyCharactersRecovered: 0, xpEarned: 0, dailyGoalCompleted: false };
  const rows = await sql()`
    insert into daily_activity (activity_date) values (${dateKey})
    on conflict (activity_date) do update set activity_date = excluded.activity_date
    returning *
  `;
  const row = rows[0];
  return {
    activityDate: row.activity_date,
    questionsAttempted: row.questions_attempted,
    correctAnswers: row.correct_answers,
    incorrectAnswers: row.incorrect_answers,
    newCharactersSeen: row.new_characters_seen,
    charactersMastered: row.characters_mastered,
    rustyCharactersRecovered: row.rusty_characters_recovered,
    xpEarned: row.xp_earned,
    dailyGoalCompleted: row.daily_goal_completed
  };
}

export async function updateAfterAnswer(args: { profile: LearnerProfile; activity: DailyActivity; xpDelta: number; isCorrect: boolean; masteredNow: boolean; recoveredRusty: boolean }): Promise<void> {
  if (!databaseConfigured()) return;
  const activityAfterAnswer: DailyActivity = {
    ...args.activity,
    questionsAttempted: args.activity.questionsAttempted + 1,
    correctAnswers: args.activity.correctAnswers + (args.isCorrect ? 1 : 0),
    incorrectAnswers: args.activity.incorrectAnswers + (args.isCorrect ? 0 : 1),
    charactersMastered: args.activity.charactersMastered + (args.masteredNow ? 1 : 0),
    rustyCharactersRecovered: args.activity.rustyCharactersRecovered + (args.recoveredRusty ? 1 : 0),
    xpEarned: args.activity.xpEarned + args.xpDelta
  };
  const profileAfterAnswer = { ...args.profile, totalXp: args.profile.totalXp + args.xpDelta, playerLevel: playerLevelForXp(args.profile.totalXp + args.xpDelta) };
  const daily = applyDailyGoal(profileAfterAnswer, activityAfterAnswer);
  await sql()`
    update learner_profile set
      total_xp=${daily.profile.totalXp},
      player_level=${daily.profile.playerLevel},
      current_streak_days=${daily.profile.currentStreakDays},
      longest_streak_days=${daily.profile.longestStreakDays},
      last_completed_day=${daily.profile.lastCompletedDay},
      updated_at=now()
    where id=${args.profile.id}
  `;
  await sql()`
    update daily_activity set
      questions_attempted=${daily.activity.questionsAttempted},
      correct_answers=${daily.activity.correctAnswers},
      incorrect_answers=${daily.activity.incorrectAnswers},
      characters_mastered=${daily.activity.charactersMastered},
      rusty_characters_recovered=${daily.activity.rustyCharactersRecovered},
      xp_earned=${daily.activity.xpEarned},
      daily_goal_completed=${daily.activity.dailyGoalCompleted}
    where activity_date=${args.activity.activityDate}
  `;
}
