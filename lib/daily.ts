import { previousMadridDateKey } from "./dates";
import type { DailyActivity, LearnerProfile } from "./progress";
import { playerLevelForXp } from "./progress";

export const DAILY_ATTEMPT_GOAL = 10;
export const DAILY_CORRECT_GOAL = 5;

export function dailyGoalMet(activity: DailyActivity): boolean {
  return activity.questionsAttempted >= DAILY_ATTEMPT_GOAL && activity.correctAnswers >= DAILY_CORRECT_GOAL;
}

export function applyDailyGoal(profile: LearnerProfile, activity: DailyActivity): { profile: LearnerProfile; activity: DailyActivity; bonusXp: number } {
  if (activity.dailyGoalCompleted || !dailyGoalMet(activity)) return { profile, activity, bonusXp: 0 };
  const continued = profile.lastCompletedDay === previousMadridDateKey(activity.activityDate);
  const first = profile.lastCompletedDay === null;
  const currentStreakDays = continued || first ? profile.currentStreakDays + 1 : 1;
  const bonusXp = 50 + (continued ? 10 : 0);
  const totalXp = profile.totalXp + bonusXp;
  return {
    activity: { ...activity, dailyGoalCompleted: true, xpEarned: activity.xpEarned + bonusXp },
    profile: {
      ...profile,
      totalXp,
      playerLevel: playerLevelForXp(totalXp),
      currentStreakDays,
      longestStreakDays: Math.max(profile.longestStreakDays, currentStreakDays),
      lastCompletedDay: activity.activityDate
    },
    bonusXp
  };
}
