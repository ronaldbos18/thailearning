"use server";

import { redirect } from "next/navigation";
import { passwordMatches, setAuthCookie } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/") || "/";
  if (!passwordMatches(password)) redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  await setAuthCookie();
  redirect(next.startsWith("/") ? next : "/");
}
