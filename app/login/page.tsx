import { loginAction } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-sky-950 p-6">
      <form action={loginAction} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-slate-950">Private Thai Learning App</h1>
        <p className="mt-2 text-slate-600">Enter the app password to continue.</p>
        {params.error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{params.error === "config" ? "Authentication is not configured correctly." : "Incorrect password."}</p> : null}
        <input type="hidden" name="next" value={params.next ?? "/"} />
        <label className="mt-6 block text-sm font-bold text-slate-700" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" />
        <button className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white">Log in</button>
      </form>
    </main>
  );
}
