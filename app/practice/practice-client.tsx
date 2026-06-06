"use client";

import { useEffect, useState } from "react";
import { CharacterKnowledgeBadges, FontModeBadge, LearningCard } from "@/components/learning-card";
import type { FontMode, ThaiCharacter } from "@/data/characters/types";

type Question = {
  needsLearning?: boolean;
  questionToken: string;
  characterId: string;
  thaiTraditional: string;
  thaiModern: string;
  shownFontMode: FontMode;
  source: string;
  options: { id: string; label: string }[];
};

type Feedback = {
  isCorrect: boolean;
  correctAnswer: string;
  selectedAnswer: string;
  comparison: string | null;
  notice: string | null;
  xpAwarded: number;
  masteryLevel: number;
  correctStreak: number;
  character: ThaiCharacter;
  selectedCharacter: ThaiCharacter;
};


function FeedbackCharacterPanel({ label, character, tone }: { label: string; character: ThaiCharacter; tone: "correct" | "selected" }) {
  const border = tone === "correct" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50";
  return (
    <div className={`rounded-2xl border p-4 ${border}`}>
      <p className="text-xs font-black uppercase tracking-wide text-slate-600">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <CharacterKnowledgeBadges character={character} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <FontModeBadge label="Traditional" />
          <span className="font-traditionalThai mt-2 block text-5xl font-black leading-none text-thai-ink">{character.thaiTraditional}</span>
        </div>
        <div>
          <FontModeBadge label="Modern" />
          <span className="font-modernThai mt-2 block text-5xl font-black leading-none text-thai-ink">{character.thaiModern}</span>
        </div>
      </div>
      <p className="mt-2 font-bold text-slate-950">{character.romanisedName}</p>
      <p className="text-sm text-slate-600">Rough sound: {character.roughSound}</p>
    </div>
  );
}

export function PracticeClient() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadQuestion() {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch("/api/practice/next", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error ?? "Could not load the next question.");
      setQuestion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the next question.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadQuestion(); }, []);

  async function answer(selectedCharacterId: string) {
    if (!question || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/practice/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionToken: question.questionToken, selectedCharacterId })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error ?? "Could not submit the answer.");
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the answer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !question && !feedback) return <p className="rounded-2xl bg-white p-6">Loading practice…</p>;
  if (error) return <div className="mt-6 rounded-2xl bg-red-50 p-6 font-semibold text-red-900"><p>{error}</p><button onClick={() => void loadQuestion()} className="mt-3 rounded-xl bg-red-900 px-4 py-2 text-white">Reload question</button></div>;
  if (question?.needsLearning) {
    return <p className="mt-6 rounded-2xl bg-amber-50 p-6 font-semibold text-amber-900">Learn a character batch first. New characters must be seen as learning cards before practice.</p>;
  }

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Thai character first · {question?.shownFontMode}</p>
        <div className="mt-6 flex min-h-40 items-center justify-center rounded-3xl bg-slate-50">
          {question?.shownFontMode === "traditional" || question?.shownFontMode === "both" ? <span className="font-traditionalThai mx-3 text-8xl font-black">{question.thaiTraditional}</span> : null}
          {question?.shownFontMode === "modern" || question?.shownFontMode === "both" ? <span className="font-modernThai mx-3 text-8xl font-black">{question.thaiModern}</span> : null}
        </div>
        {!feedback ? (
          <div className="mt-6 grid gap-3">
            {question?.options.map((option) => (
              <button key={option.id} disabled={submitting || Boolean(feedback)} onClick={() => void answer(option.id)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-bold hover:border-sky-400 hover:bg-sky-50">
                {option.label}
              </button>
            ))}
          </div>
        ) : <button onClick={() => void loadQuestion()} className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">Continue to next question</button>}
      </div>
      {feedback ? (
        <div className="space-y-4">
          <div className={`rounded-3xl p-5 ${feedback.isCorrect ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
            <h2 className="text-2xl font-black">{feedback.isCorrect ? "Correct" : "Incorrect"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FeedbackCharacterPanel label="Correct answer" character={feedback.character} tone="correct" />
              {!feedback.isCorrect ? <FeedbackCharacterPanel label="You chose" character={feedback.selectedCharacter} tone="selected" /> : null}
            </div>
            {feedback.comparison ? (
              <div className="mt-4 rounded-2xl bg-white/80 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Why this pair is confusing</p>
                <p className="mt-1 font-semibold text-slate-900">{feedback.comparison}</p>
              </div>
            ) : null}
            {feedback.notice ? <p className="mt-3 font-semibold">{feedback.notice}</p> : null}
            <p className="mt-3">Mastery level {feedback.masteryLevel} · correct streak {feedback.correctStreak} · +{feedback.xpAwarded} XP</p>
          </div>
          <LearningCard character={feedback.character} />
        </div>
      ) : <p className="rounded-3xl bg-sky-50 p-6 text-sky-900">Choose one answer. The server checks correctness, updates mastery, schedules review, and awards XP.</p>}
    </section>
  );
}
