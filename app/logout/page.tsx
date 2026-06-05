import { redirect } from "next/navigation";
import { clearAuthCookie } from "@/lib/auth";

export default async function LogoutPage() {
  await clearAuthCookie();
  redirect("/login");
}
