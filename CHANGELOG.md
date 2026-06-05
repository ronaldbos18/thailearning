# Changelog

## Unreleased

- Refined Phase 1 Thai consonant/vowel content for complete 44-consonant and 33-vowel recognition coverage, RTGS-style learner romanisation consistency, clearer rough-sound cues, dotted-circle notation, content-frequency classification, and explicit rare/obsolete labels.
- Reworked learning order to mix consonants and vowels early while delaying confusing visual/sound groups.
- Replaced generic confusing-character fallbacks with pair-specific visual and sound explanations and validation tests.
- Improved learning cards and incorrect-answer feedback with side-by-side traditional/modern font samples, rare/uncommon badges, dotted-circle guidance, and clearer comparison panels.
- Documented Thai content conventions and remaining human linguistic review areas.

- Upgraded Next.js from 15.3.4 to patched 15.3.8 for Vercel deployment security compatibility.
- Added Phase 1 MVP foundation for Thai alphabet visual recognition.
- Added password-only private access and protected routes.
- Added canonical Thai character data, learning batches, and confusing-character comparisons.
- Added server-side practice engine, signed question-token validation, database-authoritative replay protection, transactionally locked answer processing, mastery progression, decay states, XP, daily goals, and streak logic.
- Added Supabase/Postgres migration for progress-only persistence.
- Added project documentation and CI workflow.
