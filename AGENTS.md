# Thai Learning App Agent Notes

- This repository is a Next.js App Router, React, TypeScript, and Tailwind app deployed on Vercel.
- Repository documentation is canonical; update docs when behaviour or setup changes.
- Use password-only private access with `/login`, `/logout`, and middleware-protected routes.
- Keep Supabase/Postgres access server-side only through `THAI_APP_DATABASE_URL`; never expose DB credentials to browser code.
- Do not commit secrets or real environment values.
- Do not hand-edit `package-lock.json`; regenerate it with npm when dependency metadata changes.
- GitHub Actions and Vercel Preview are the validation sources of truth.
