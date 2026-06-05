# Project Overview

This app helps one private learner recognise Thai consonants and vowels in traditional and modern font forms.

## Implemented MVP areas

- Password-only auth via `/login`, `/logout`, and middleware.
- Protected dashboard, learn, practice, progress, and character reference routes.
- Git-based Thai consonant and vowel content with learning order and confusing-character comparisons.
- Server-owned practice decisions: question selection, distractors, answer checking, progress updates, XP, review scheduling, and streak updates.
- Supabase/Postgres migration for learner progress tables.

## Content policy

Character content is canonical in the repository, not the database. The vowel set is a near-complete Phase 1 recognition set and is documented as course-reviewable because Thai vowel coverage varies by teaching approach.
