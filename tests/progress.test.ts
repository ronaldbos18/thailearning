import { describe, expect, it } from "vitest";
import { madridDateKey } from "@/lib/dates";
import { applyDailyGoal, dailyGoalMet } from "@/lib/daily";
import { applyAnswerProgress, confidenceFor, emptyProgress, type DailyActivity, type LearnerProfile } from "@/lib/progress";

describe("mastery, decay, XP, and streaks", () => {
  it("requires both traditional and modern recognition for Level 5", () => {
    let progress = emptyProgress("con_gor_gai");
    for (let i = 0; i < 5; i++) progress = applyAnswerProgress({ progress, isCorrect: true, shownFontMode: "traditional" }).progress;
    expect(progress.correctStreak).toBe(5);
    expect(progress.masteryLevel).toBe(4);
    progress = applyAnswerProgress({ progress, isCorrect: true, shownFontMode: "modern" }).progress;
    expect(progress.masteryLevel).toBe(5);
  });

  it("resets correct streak on incorrect answers and schedules a soon retry", () => {
    const result = applyAnswerProgress({ progress: { ...emptyProgress("con_gor_gai"), correctStreak: 3 }, isCorrect: false, shownFontMode: "modern", now: new Date("2026-06-05T09:00:00.000Z") });
    expect(result.progress.correctStreak).toBe(0);
    expect(result.progress.confidenceState).toBe("due");
  });

  it("allows Level 5 characters to become rusty without losing historical mastery", () => {
    const progress = { ...emptyProgress("con_gor_gai"), masteryLevel: 5, nextReviewAt: "2026-06-01T09:00:00.000Z", confidenceState: "fresh" as const };
    expect(confidenceFor(progress, new Date("2026-06-05T09:00:00.000Z"))).toBe("rusty");
    expect(progress.masteryLevel).toBe(5);
  });

  it("awards correct, first-attempt, rusty recovery, and mastery XP", () => {
    const rusty = { ...emptyProgress("con_gor_gai"), masteryLevel: 4, correctStreak: 4, totalAttempts: 10, traditionalCorrectCount: 1, modernCorrectCount: 0, nextReviewAt: "2026-06-01T09:00:00.000Z", confidenceState: "fresh" as const };
    const result = applyAnswerProgress({ progress: rusty, isCorrect: true, shownFontMode: "modern", now: new Date("2026-06-05T09:00:00.000Z") });
    expect(result.masteredNow).toBe(true);
    expect(result.recoveredRusty).toBe(true);
    expect(result.xpAwarded).toBe(130);
  });

  it("uses Europe/Madrid date boundaries", () => {
    expect(madridDateKey(new Date("2026-06-04T22:30:00.000Z"))).toBe("2026-06-05");
  });

  it("completes daily goal and continues streak only when both targets are met", () => {
    const activity: DailyActivity = { activityDate: "2026-06-05", questionsAttempted: 10, correctAnswers: 5, incorrectAnswers: 5, newCharactersSeen: 0, charactersMastered: 0, rustyCharactersRecovered: 0, xpEarned: 100, dailyGoalCompleted: false };
    const profile: LearnerProfile = { id: "solo", totalXp: 100, playerLevel: 1, currentStreakDays: 2, longestStreakDays: 2, lastCompletedDay: "2026-06-04" };
    expect(dailyGoalMet(activity)).toBe(true);
    const result = applyDailyGoal(profile, activity);
    expect(result.activity.dailyGoalCompleted).toBe(true);
    expect(result.profile.currentStreakDays).toBe(3);
    expect(result.bonusXp).toBe(60);
  });
});
