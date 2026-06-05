import { characterById } from "@/data/characters";
import type { ThaiCharacter } from "@/data/characters/types";

function ComparisonList({ title, items }: { title: string; items: ThaiCharacter["visualSimilarities"] }) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <h4 className="text-sm font-semibold text-amber-900">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm text-amber-950">
        {items.map((item) => {
          const other = characterById.get(item.characterId);
          return (
            <li key={item.characterId}>
              <span className="font-modernThai text-2xl font-bold">{other?.thaiModern ?? item.characterId}</span>{" "}
              <span className="font-semibold">{other?.romanisedName}</span> — {item.explanation}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LearningCard({ character }: { character: ThaiCharacter }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-5">
        <div>
          <span className="rounded-full bg-thai-saffron/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-thai-saffron">Traditional</span>
          <p className="font-traditionalThai mt-2 text-7xl font-bold text-thai-ink">{character.thaiTraditional}</p>
        </div>
        <div>
          <span className="rounded-full bg-thai-sky/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-thai-sky">Modern</span>
          <p className="font-modernThai mt-2 text-7xl font-bold text-thai-ink">{character.thaiModern}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Romanised name</p>
          <p className="text-xl font-bold text-slate-950">{character.romanisedName}</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Rough sound</p>
          <p className="text-xl font-bold text-slate-950">{character.roughSound}</p>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-700">{character.mnemonic}</p>
      {character.exampleCue ? <p className="mt-2 text-sm text-slate-500">Cue: {character.exampleCue}</p> : null}
      <div className="mt-4 grid gap-3">
        <ComparisonList title="Looks similar to" items={character.visualSimilarities} />
        <ComparisonList title="Sounds similar to" items={character.soundSimilarities} />
      </div>
    </article>
  );
}
