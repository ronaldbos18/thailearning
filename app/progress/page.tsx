import { Nav } from "@/components/nav";
import { StatCard } from "@/components/stat-card";
import { enabledCharacters } from "@/data/characters";
import { requireAuth } from "@/lib/auth";
import { getCharacterProgress, getDailyActivity, getProfile } from "@/lib/db";
import { confidenceFor } from "@/lib/progress";

export default async function ProgressPage() {
  await requireAuth();
  const [profile, progress, activity] = await Promise.all([getProfile(), getCharacterProgress(), getDailyActivity()]);
  const attempts = progress.reduce((sum, item) => sum + item.totalAttempts, 0);
  const correct = progress.reduce((sum, item) => sum + item.totalCorrect, 0);
  const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
  const mastered = progress.filter((item) => item.masteryLevel === 5).length;
  const rusty = progress.filter((item) => confidenceFor(item) === "rusty").length;
  return (
    <main className="mx-auto max-w-6xl p-6">
      <Nav />
      <h1 className="text-3xl font-black">Progress</h1>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall progress" value={`${mastered}/${enabledCharacters.length}`} hint="memorised characters" />
        <StatCard label="Accuracy" value={`${accuracy}%`} hint={`${correct}/${attempts} correct`} />
        <StatCard label="XP" value={profile.totalXp} hint={`Level ${profile.playerLevel}`} />
        <StatCard label="Streaks" value={`${profile.currentStreakDays}/${profile.longestStreakDays}`} hint="current / longest" />
        <StatCard label="Daily questions" value={activity.questionsAttempted} />
        <StatCard label="Daily correct" value={activity.correctAnswers} />
        <StatCard label="Rusty status" value={rusty} hint="recover for bonus XP" />
      </section>
      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Mastery distribution</h2>
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3, 4, 5].map((level) => {
            const count = level === 0 ? enabledCharacters.length - progress.filter((p) => p.masteryLevel > 0).length : progress.filter((p) => p.masteryLevel === level).length;
            return <div key={level} className="flex items-center gap-3"><span className="w-24 font-semibold">Level {level}</span><div className="h-3 flex-1 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-sky-500" style={{ width: `${(count / enabledCharacters.length) * 100}%` }} /></div><span>{count}</span></div>;
          })}
        </div>
      </section>
    </main>
  );
}
