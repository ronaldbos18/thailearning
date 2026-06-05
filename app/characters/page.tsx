import { LearningCard } from "@/components/learning-card";
import { Nav } from "@/components/nav";
import { enabledCharacters } from "@/data/characters";
import { requireAuth } from "@/lib/auth";
import { getCharacterProgress } from "@/lib/db";
import { confidenceFor, emptyProgress } from "@/lib/progress";

export default async function CharactersPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAuth();
  const [{ id }, progress] = await Promise.all([searchParams, getCharacterProgress()]);
  const selected = enabledCharacters.find((character) => character.id === id) ?? enabledCharacters[0];
  const selectedProgress = progress.find((item) => item.characterId === selected.id) ?? emptyProgress(selected.id);
  return (
    <main className="mx-auto max-w-6xl p-6">
      <Nav />
      <h1 className="text-3xl font-black">Character reference</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
        <aside className="max-h-[70vh] overflow-auto rounded-3xl bg-white p-3 shadow-sm">
          {enabledCharacters.map((character) => {
            const item = progress.find((p) => p.characterId === character.id) ?? emptyProgress(character.id);
            return (
              <a key={character.id} href={`/characters?id=${character.id}`} className={`mb-2 flex items-center gap-3 rounded-2xl p-3 hover:bg-slate-50 ${character.id === selected.id ? "bg-sky-50" : ""}`}>
                <span className="font-modernThai text-3xl font-bold">{character.thaiModern}</span>
                <span><strong>{character.romanisedName}</strong><br /><small>Level {item.masteryLevel} · {confidenceFor(item)}</small></span>
              </a>
            );
          })}
        </aside>
        <section className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Status</h2>
            <p>Mastery level {selectedProgress.masteryLevel}; confidence {confidenceFor(selectedProgress)}; streak {selectedProgress.correctStreak}; attempts {selectedProgress.totalAttempts}.</p>
            <p className="mt-2 text-sm text-slate-600">Traditional recognitions: {selectedProgress.traditionalCorrectCount}; modern recognitions: {selectedProgress.modernCorrectCount}; both-font practice: {selectedProgress.bothFontsCorrectCount}.</p>
          </div>
          <LearningCard character={selected} />
        </section>
      </div>
    </main>
  );
}
