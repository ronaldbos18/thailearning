import { Nav } from "@/components/nav";
import { requireAuth } from "@/lib/auth";
import { PracticeClient } from "./practice-client";

export default async function PracticePage() {
  await requireAuth();
  return (
    <main className="mx-auto max-w-6xl p-6">
      <Nav />
      <h1 className="text-3xl font-black">Practice</h1>
      <p className="mt-2 text-slate-600">Multiple choice only. Phase 1 never tests English-to-Thai and never asks you to type.</p>
      <PracticeClient />
    </main>
  );
}
