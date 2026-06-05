# Thai Alphabet Learning App

Personal Phase 1 MVP for learning Thai consonant and vowel visual recognition.

## Scope

Phase 1 only tests Thai character → romanised name / rough sound. It does not include English-to-Thai questions, typing, tones, audio, pronunciation grading, spelling, vocabulary, or sentences. The canonical content currently covers all 44 Thai consonants and 33 Phase 1 vowel recognition units, including rare/obsolete reference forms that are labelled as such.

## Thai content conventions

- Romanised names use a simple RTGS-style, tone-free learner spelling such as `ko kai`, `kho khai`, and `sara aa`.
- Rough sounds are intentionally approximate Phase 1 recognition cues, not pronunciation lessons or tone rules.
- Vowel combinations use a dotted circle (`◌`) to show where the consonant sits when a vowel appears before, above, below, after, or around it. The dotted circle is not part of Thai spelling; standalone vowel-like characters such as `ฤ`, `ฤๅ`, `ฦ`, and `ฦๅ` do not use it.
- Traditional and modern rendering are shown side by side with Noto Serif Thai and Noto Sans Thai respectively; labels describe them as serif-style print and sans-style UI examples.
- Comparison notes are pair-specific so learners can focus on visible stroke differences or name/sound cue differences without introducing Phase 2 tone instruction.
- Content frequency is tracked as `common`, `uncommon`, or `rare`; rare vowels remain in the reference, are deliberately placed late in learning order, and can enter practice after introduction. Automatic learning batches unlock rare content only after at least 60 non-rare characters have been introduced, or after all non-rare characters if fewer than 60 exist in a future dataset. `ฤ` is currently treated as uncommon, while `ฤๅ`, `ฦ`, and `ฦๅ` are treated as rare.

### Human linguistic review still recommended

The dataset has been normalised for Phase 1 learning usefulness, but a Thai teacher/native-speaker review is still recommended before treating the content as authoritative pronunciation instruction. In particular, review rough-sound wording, rare/uncommon vowel classification (`ฤ`, `ฤๅ`, `ฦ`, `ฦๅ`), obsolete consonant presentation (`ฃ`, `ฅ`), and course-specific romanisation preferences.

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

GitHub Actions and Vercel Preview remain the source of truth for PR validation. Pull requests are not considered complete until `npm ci`, typecheck, tests, Next build, and Vercel Preview pass.
