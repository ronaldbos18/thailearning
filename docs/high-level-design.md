# High-Level Design

## Architecture

The app uses Next.js App Router on Vercel. Middleware protects all routes except `/login`; `/logout` clears the signed HTTP-only session cookie.

## Data ownership

- `data/characters/*`: canonical Thai consonant/vowel content, learning order, and confusing groups.
- Supabase/Postgres: progress only (`learner_profile`, `character_progress`, `answer_history`, `daily_activity`, optional `practice_sessions`).

## Server/client split

Server code validates auth, reads/writes Postgres, selects questions, signs issued question tokens, selects distractors, checks answers, and transactionally updates answer history, mastery/review scheduling, XP, daily activity, and streaks.

Client code renders cards/questions, captures multiple-choice selections, submits answers, displays feedback, and waits for explicit continuation.

## Practice priority

The engine prioritises immediate retries, rusty characters, overdue reviews, due reviews, recent learning, normal review, and finally new characters when allowed.

## Security

No browser code receives `THAI_APP_DATABASE_URL`, passwords, or auth secrets. Server routes and API endpoints call auth validation before private work.

## Thai font rendering

Traditional cards use Google Fonts `Noto Serif Thai`; modern cards use Google Fonts `Noto Sans Thai`. Both are Noto-family fonts distributed under the SIL Open Font License by Google Fonts. The Tailwind classes are `font-traditionalThai` and `font-modernThai`, and both classes are used on learning cards and practice prompts.

## Transaction and replay guarantees

`question_token_hash` is unique in `answer_history` and is the authoritative replay protection for deployed multi-instance environments. `processAnswerAtomically()` creates/locks the learner profile, daily activity, and character progress rows inside the same Postgres transaction before applying XP, mastery, daily counters, and streak updates.
