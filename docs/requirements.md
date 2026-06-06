# Requirements

## Product goal

Create a private app for recognising Thai consonants and vowels visually.

## Phase 1 includes

- Thai character → romanised name / rough sound multiple choice using tone-free Phase 1 learner cues.
- Traditional and modern Thai font display, labelled with consistent colours as serif-style print and sans-style UI examples on mobile and desktop.
- Mixed consonant/vowel learning batches of 3–5 that start with visually distinct characters and delay high-confusion groups.
- Learning cards before quiz exposure.
- Pair-specific confusing visual and sound comparisons that avoid tone rules and generic placeholder wording.
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


## Phase 1 Thai content rules

- The enabled dataset must include all 44 Thai consonants and the configured 33 Phase 1 vowel recognition units.
- All IDs in `data/characters/learning-order.ts`, visual groups, and sound groups must resolve to enabled characters exactly once where uniqueness is required.
- Similar-character relationships must be reciprocal through their configured groups and must have explicit pair-level explanations.
- No generic fallback comparison copy should appear in learner-facing cards or feedback.
- Non-standalone vowel signs and patterns must use dotted-circle notation (`◌`) consistently; standalone vowel-like characters (`ฤ`, `ฤๅ`, `ฦ`, `ฦๅ`) must not.
- Consonants must carry informational low/mid/high class metadata and display colour-coded class labels on learning and reference cards without being tested.
- Vowels must carry informational short/long/standalone metadata and display colour-coded category labels on learning and reference cards without being tested.
- Rare and uncommon vowels must be labelled near the top of learning/reference cards, remain available in the character reference, appear late where configured, and remain eligible for practice after deliberate introduction.
- Automatic learning batches must withhold rare characters until at least 60 non-rare characters have been introduced, or until all non-rare characters have been introduced if a future dataset contains fewer than 60 non-rare characters. Once introduced, rare characters use the same practice, mastery, review, decay, and progress rules as other characters.
- `ฤ` is classified as uncommon pending human review; `ฤๅ`, `ฦ`, and `ฦๅ` are classified as rare.
- Linguistic nuance beyond visual recognition, rough romanised names, and rough sound labels remains a human-review item rather than a Phase 2 feature.
