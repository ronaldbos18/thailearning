# Requirements

## Product goal

Create a private app for recognising Thai consonants and vowels visually.

## Phase 1 includes

- Thai character → romanised name / rough sound multiple choice.
- Traditional and modern Thai font display.
- Mixed consonant/vowel learning batches of 3–5.
- Learning cards before quiz exposure.
- Confusing visual and sound comparisons.
- Server-side answer checking and progress updates.
- XP, player level, daily streak, daily goal, mastery, review queue, and rusty recovery.

## Phase 1 excludes

- English-to-Thai testing.
- Typing answers.
- Tones, audio, pronunciation grading, spelling, vocabulary, words, and sentences.
- Badges, leaderboards, social features, or virtual currency.

## Daily goal

A Europe/Madrid day is complete only after at least 10 attempted questions and at least 5 correct answers.

## Current implementation constraints

- Practice answers are validated against a signed, expiring server-issued question token. The client may only submit the token and selected option ID.
- New learning batches must match the expected next configured batch and are withheld when the active unmastered set or review backlog is too large.
- Production auth fails closed when `THAI_APP_PASSWORD` or `THAI_APP_AUTH_SECRET` is missing, or when the local fallback secret is used.
