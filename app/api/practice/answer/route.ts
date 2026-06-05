import { NextResponse } from "next/server";
import { characterById, getCharacterOrThrow } from "@/data/characters";
import { requireAuth } from "@/lib/auth";
import { getCharacterProgress, getDailyActivity, getProfile, insertAnswer, updateAfterAnswer, upsertCharacterProgress } from "@/lib/db";
import { applyAnswerProgress, emptyProgress } from "@/lib/progress";
import { comparisonFeedback } from "@/lib/practice-engine";

export async function POST(request: Request) {
  await requireAuth();
  const body = (await request.json()) as { characterId?: string; selectedCharacterId?: string; shownFontMode?: "traditional" | "modern" | "both"; source?: string };
  if (!body.characterId || !body.selectedCharacterId || !body.shownFontMode) return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 });
  const correct = getCharacterOrThrow(body.characterId);
  const selected = characterById.get(body.selectedCharacterId);
  if (!selected) return NextResponse.json({ error: "Unknown selected character" }, { status: 400 });
  const [allProgress, profile, activity] = await Promise.all([getCharacterProgress(), getProfile(), getDailyActivity()]);
  const currentProgress = allProgress.find((item) => item.characterId === correct.id) ?? emptyProgress(correct.id);
  const isCorrect = selected.id === correct.id;
  const result = applyAnswerProgress({ progress: currentProgress, isCorrect, shownFontMode: body.shownFontMode });
  await upsertCharacterProgress(result.progress);
  await insertAnswer({ characterId: correct.id, selectedCharacterId: selected.id, shownFontMode: body.shownFontMode, isCorrect, questionSource: body.source ?? "review", answeredAt: new Date().toISOString(), xpAwarded: result.xpAwarded });
  await updateAfterAnswer({ profile, activity, xpDelta: result.xpAwarded, isCorrect, masteredNow: result.masteredNow, recoveredRusty: result.recoveredRusty });
  return NextResponse.json({
    isCorrect,
    correctAnswer: `${correct.romanisedName} — ${correct.roughSound}`,
    selectedAnswer: `${selected.romanisedName} — ${selected.roughSound}`,
    comparison: isCorrect ? null : comparisonFeedback(correct, selected),
    notice: isCorrect ? null : "This character will return soon for an immediate retry.",
    xpAwarded: result.xpAwarded,
    masteryLevel: result.progress.masteryLevel,
    correctStreak: result.progress.correctStreak,
    character: correct
  });
}
