import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCharacterProgress, recentHistory } from "@/lib/db";
import { createQuestion, introducedIds } from "@/lib/practice-engine";

export async function GET() {
  await requireAuth();
  const [progress, history] = await Promise.all([getCharacterProgress(), recentHistory()]);
  if (introducedIds(progress).size === 0) return NextResponse.json({ needsLearning: true });
  const question = createQuestion({ progress, history, allowNew: false });
  return NextResponse.json({
    characterId: question.character.id,
    thaiTraditional: question.character.thaiTraditional,
    thaiModern: question.character.thaiModern,
    shownFontMode: question.shownFontMode,
    source: question.source,
    options: question.options.map((option) => ({ id: option.id, label: `${option.romanisedName} — ${option.roughSound}` }))
  });
}
