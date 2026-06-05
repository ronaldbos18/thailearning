# Thai Alphabet Learning App

Personal Phase 1 MVP for learning Thai consonant and vowel visual recognition.

## Scope

Phase 1 only tests Thai character → romanised name / rough sound. It does not include English-to-Thai questions, typing, tones, audio, pronunciation grading, spelling, vocabulary, or sentences.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Vercel deployment
- Password-only private access
- Server-side Postgres/Supabase progress storage

## Environment variables

Set these in Vercel and locally in `.env.local` as needed:

```bash
THAI_APP_AUTH_ENABLED=true
THAI_APP_PASSWORD=your-private-password
THAI_APP_AUTH_SECRET=long-random-secret
THAI_APP_DATABASE_URL=postgres://...
```

Use `.env.example` for local placeholders. Never commit real secrets.

## Database setup

Run the migration in `db/migrations/0001_phase1_mvp.sql` against the Supabase/Postgres database referenced by `THAI_APP_DATABASE_URL`.

The database stores learner progress only. Canonical Thai content lives in `data/characters`.

## Local validation

```bash
npm install
npm run typecheck
npm test
npm run build
```

GitHub Actions and Vercel Preview remain the source of truth for PR validation.
