---
name: Course subject migration
description: Non-obvious surfaces to update when changing this AI-course app's subject matter or branding (e.g. Quantitative Reasoning → Critical Thinking).
---

# Migrating the course subject / branding

This app (student app `qr-course`, demo `qr-course-demo`, `api-server`) carries subject-matter assumptions in many places beyond the seed data. When swapping the subject, a search for the old brand name alone is NOT enough — also grep for subject-specific vocabulary (e.g. "math", "LaTeX", "$...$", "equation").

**Why:** a final review caught leftover math-flavored AI prompts and a hardcoded algebra fallback problem after the seed + docs were already done; they only surface at runtime (degraded/fallback paths) so typecheck and the happy path hide them.

**How to apply — surfaces to update:**
- DB content: `artifacts/api-server/src/lib/seed.ts` (topics/lectures/assignments/problems) and `course.ts` WEEK_TITLES + overview title.
- AI prompts (all carry domain tone): tutor system prompt + starter-questions prompt (`routes/tutor.ts`), practice problem generator + wrong-answer tutor tip (`routes/practice.ts`), lecture-expansion prompt (`routes/diagnostics.ts`). Strip math-only instructions like "Inline math `$...$`".
- **Fallback/degraded paths**: `routes/practice.ts` has a hardcoded fallback problem used when the LLM call fails — it must match the new subject, not stay algebra.
- Diagnostics seed-integrity threshold in `routes/diagnostics.ts` (a `t.length < N` check) must match the new topic count.
- Demo video: `qr-course-demo/src/components/video/VideoTemplate.tsx` has a hardcoded sidebar logo badge (initials) outside `<AnimatePresence>`; each scene's on-screen text; stale comments in scene files.
- Branding/docs: `replit.md`, `README.md` (separate full doc), `BLUEPRINT.md` — all three duplicate the product description and topic count.
- Artifact package names stay `@workspace/qr-course*` — do NOT rename packages/slugs; only content/branding changes.

**Env note:** if topics count is 0 / tables missing on a fresh env, run `pnpm --filter @workspace/db run push` then restart `api-server` (seed runs on boot via `seedIfEmpty`).

**Retained-feature judgment:** the `MathKeyboard` component is a generic multi-subject symbol palette (has a "Logic & Sets" tab) defaulting to "Numbers"; left intact during the Critical Thinking migration to preserve functionality/UX per the "only subject matter changes" directive.
