import { characterById } from "@/data/characters";
import type { ThaiCharacter } from "@/data/characters/types";

function FontSample({ label, fontClass, value, note }: { label: string; fontClass: string; value: string; note: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600 shadow-sm">{label}</span>
        <span className="text-xs text-slate-500">{note}</span>
      </div>
      <p className={`${fontClass} mt-3 break-words text-center text-7xl font-black leading-tight text-thai-ink sm:text-8xl`}>{value}</p>
    </div>
  );
}

function ComparisonList({ title, tone, items }: { title: string; tone: "visual" | "sound"; items: ThaiCharacter["visualSimilarities"] }) {
  if (items.length === 0) return null;
  const styles = tone === "visual" ? "border-amber-200 bg-amber-50 text-amber-950" : "border-sky-200 bg-sky-50 text-sky-950";
  const heading = tone === "visual" ? "text-amber-900" : "text-sky-900";
  return (
    <section className={`rounded-2xl border p-4 ${styles}`}>
      <h4 className={`text-sm font-black uppercase tracking-wide ${heading}`}>{title}</h4>
      <ul className="mt-3 space-y-3 text-sm">
        {items.map((item) => {
          const other = characterById.get(item.characterId);
          return (
            <li key={item.characterId} className="grid gap-3 rounded-xl bg-white/70 p-3 sm:grid-cols-[5rem_1fr]">
              <div className="text-center">
                <p className="font-modernThai text-4xl font-black leading-none">{other?.thaiModern ?? item.characterId}</p>
                <p className="mt-1 text-xs font-bold text-slate-600">{other?.romanisedName ?? item.characterId}</p>
              </div>
              <p className="self-center leading-relaxed">{item.explanation}</p>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FontSample label="Traditional" fontClass="font-traditionalThai" value={character.thaiTraditional} note="serif-style print" />
        <FontSample label="Modern" fontClass="font-modernThai" value={character.thaiModern} note="sans-style UI" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-500">Romanised name</p>
          <p className="text-xl font-bold text-slate-950">{character.romanisedName}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-500">Rough sound</p>
          <p className="text-xl font-bold text-slate-950">{character.roughSound}</p>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-slate-800"><strong>Memory cue:</strong> {character.mnemonic}</p>
      {character.exampleCue ? <p className="mt-2 text-sm text-slate-500">Cue word: {character.exampleCue}</p> : null}
      <div className="mt-4 grid gap-3">
        <ComparisonList title="Visual check" tone="visual" items={character.visualSimilarities} />
        <ComparisonList title="Sound/name check" tone="sound" items={character.soundSimilarities} />
      </div>
    </article>
  );
}
