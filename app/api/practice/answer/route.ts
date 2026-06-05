import { NextResponse } from "next/server";
import { characterById, getCharacterOrThrow } from "@/data/characters";
import { requireAuth } from "@/lib/auth";
import { databaseConfigured, processAnswerAtomically } from "@/lib/db";
import { comparisonFeedback } from "@/lib/practice-engine";
import { questionTokenHash, verifyQuestionToken } from "@/lib/question-token";

const usedLocalTokens = new Set<string>();

export async function POST(request: Request) {
  await requireAuth();
  let body: { questionToken?: string; selectedCharacterId?: string };
  try {
    body = (await request.json()) as { questionToken?: string; selectedCharacterId?: string };
  } catch {
    return NextResponse.json({ error: "Malformed answer payload" }, { status: 400 });
  }
  if (!body.questionToken || !body.selectedCharacterId) return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 });
  const token = verifyQuestionToken(body.questionToken);
  if (!token) return NextResponse.json({ error: "Question expired or invalid. Please load a new question." }, { status: 409 });
  if (!token.optionIds.includes(body.selectedCharacterId)) return NextResponse.json({ error: "Selected answer was not issued for this question." }, { status: 400 });
  const tokenHash = questionTokenHash(body.questionToken);
  if (!databaseConfigured() && usedLocalTokens.has(tokenHash)) return NextResponse.json({ error: "Question was already answered. Please continue." }, { status: 409 });

  const correct = getCharacterOrThrow(token.characterId);
  const selected = characterById.get(body.selectedCharacterId);
  if (!selected) return NextResponse.json({ error: "Unknown selected character" }, { status: 400 });
  const isCorrect = selected.id === correct.id;
  const processed = await processAnswerAtomically({
    tokenHash,
    isCorrect,
    answer: { characterId: correct.id, selectedCharacterId: selected.id, shownFontMode: token.shownFontMode, isCorrect, questionSource: token.source, answeredAt: new Date().toISOString() }
  });
  if (!processed.processed) return NextResponse.json({ error: "Question was already answered. Please continue." }, { status: 409 });
  if (!databaseConfigured()) usedLocalTokens.add(tokenHash);
  return NextResponse.json({
    isCorrect,
    correctAnswer: `${correct.romanisedName} — ${correct.roughSound}`,
    selectedAnswer: `${selected.romanisedName} — ${selected.roughSound}`,
    comparison: isCorrect ? null : comparisonFeedback(correct, selected),
    notice: isCorrect ? null : "This character will return soon for an immediate retry.",
    xpAwarded: processed.xpAwarded,
    masteryLevel: processed.progress.masteryLevel,
    correctStreak: processed.progress.correctStreak,
    character: correct,
    selectedCharacter: selected
  });
}
