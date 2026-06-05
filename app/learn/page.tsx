import { LearningCard } from "@/components/learning-card";
import { Nav } from "@/components/nav";
import { requireAuth } from "@/lib/auth";
import { getCharacterProgress } from "@/lib/db";
import { nextLearningBatch } from "@/lib/practice-engine";
import { introduceCharactersAction } from "./actions";

export default async function LearnPage() {
  await requireAuth();
  const progress = await getCharacterProgress();
  const batch = nextLearningBatch(progress, 4);
  return (
    <main className="mx-auto max-w-6xl p-6">
      <Nav />
      <h1 className="text-3xl font-black">Learn new characters</h1>
      <p className="mt-2 text-slate-600">New consonants and vowels are introduced in mixed batches of 3–5 before they can appear in quiz practice.</p>
      {batch.length === 0 ? <p className="mt-6 rounded-2xl bg-white p-6">All enabled characters have been introduced.</p> : null}
      <form action={introduceCharactersAction} className="mt-6">
        <div className="thai-card-grid">
          {batch.map((character) => (
            <div key={character.id}>
              <input type="hidden" name="characterId" value={character.id} />
              <LearningCard character={character} />
            </div>
          ))}
        </div>
        {batch.length > 0 ? <button className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">Mark batch learned</button> : null}
      </form>
    </main>
  );
}
