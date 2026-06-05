import Link from "next/link";
import { Nav } from "@/components/nav";
import { StatCard } from "@/components/stat-card";
import { enabledCharacters } from "@/data/characters";
import { requireAuth } from "@/lib/auth";
import { getCharacterProgress, getDailyActivity, getProfile } from "@/lib/db";
import { DAILY_ATTEMPT_GOAL, DAILY_CORRECT_GOAL } from "@/lib/daily";
import { confidenceFor } from "@/lib/progress";

export default async function HomePage() {
  await requireAuth();
  const [profile, progress, activity] = await Promise.all([getProfile(), getCharacterProgress(), getDailyActivity()]);
  const introduced = progress.filter((item) => item.firstSeenAt || item.masteryLevel > 0).length;
  const mastered = progress.filter((item) => item.masteryLevel === 5).length;
  const rusty = progress.filter((item) => confidenceFor(item) === "rusty").length;
  const reviewQueue = progress.filter((item) => ["due", "rusty"].includes(confidenceFor(item))).length;
  return (
    <main className="mx-auto max-w-6xl p-6">
      <Nav />
      <section className="rounded-3xl bg-gradient-to-br from-sky-100 to-fuchsia-100 p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-sky-700">Phase 1 MVP</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Thai visual recognition dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-700">Learn Thai consonants and vowels from mixed batches, then practise Thai character → romanised name and rough sound.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/practice" className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">Start Practice</Link>
          <Link href="/learn" className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 ring-1 ring-slate-200">Learn New Characters</Link>
        </div>
      </section>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Daily goal" value={`${activity.questionsAttempted}/${DAILY_ATTEMPT_GOAL}`} hint={`${activity.correctAnswers}/${DAILY_CORRECT_GOAL} correct required`} />
        <StatCard label="Current streak" value={`${profile.currentStreakDays} days`} />
        <StatCard label="XP / level" value={`${profile.totalXp} XP`} hint={`Level ${profile.playerLevel}`} />
        <StatCard label="Characters introduced" value={`${introduced}/${enabledCharacters.length}`} />
        <StatCard label="Characters mastered" value={mastered} />
        <StatCard label="Rusty characters" value={rusty} />
        <StatCard label="Review queue" value={reviewQueue} />
      </section>
    </main>
  );
}
