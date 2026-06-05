"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { markCharactersIntroduced } from "@/lib/db";

export async function introduceCharactersAction(formData: FormData) {
  await requireAuth();
  const ids = formData.getAll("characterId").map(String);
  await markCharactersIntroduced(ids);
  revalidatePath("/");
  revalidatePath("/learn");
}
