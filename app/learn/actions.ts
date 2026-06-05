"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { getCharacterProgress, markCharactersIntroduced } from "@/lib/db";
import { expectedLearningBatchIds } from "@/lib/practice-engine";

export async function introduceCharactersAction(formData: FormData) {
  await requireAuth();
  const submittedIds = formData.getAll("characterId").map(String).sort();
  const progress = await getCharacterProgress();
  const expectedIds = expectedLearningBatchIds(progress, 4).sort();
  if (expectedIds.length === 0 || submittedIds.join("|") !== expectedIds.join("|")) {
    throw new Error("Only the expected next learning batch can be introduced.");
  }
  await markCharactersIntroduced(expectedIds);
  revalidatePath("/");
  revalidatePath("/learn");
}
