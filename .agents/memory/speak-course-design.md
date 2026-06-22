---
name: Podium speak-course design decisions
description: Intentional scope decisions for the Podium public-speaking app (speak-course) that differ from the sibling qr-course — so reviews don't re-flag them as gaps.
---

# Podium (speak-course) — intentional scope decisions

`speak-course` (student app), `speak-course-demo` (video), shared `api-server`. Mirrors qr-course but with a deliberately narrower AI-detection scope.

- **GPTZero is diagnostics-only here, NOT submission-time detection.** qr-course runs two-layer AI-authorship detection on every submission; speak-course's spec only required AssemblyAI transcription + Anthropic grading on submit, and GPTZero solely as a System-Diagnostic connectivity check. The README/BLUEPRINT match this. **Why:** code review (architect) assumes full qr-course parity and will report "GPTZero not integrated into the submission pipeline" as a blocking gap — it is NOT a gap, it is the documented design. **How to apply:** before "fixing" it, confirm the spec actually asks for per-submission detection; otherwise leave it and don't expand scope.

- **Submission pipeline returns 502 on AI failure** (transcription or evaluation) and persists a `failed` response row — by design, surfaced as an explicit failure rather than a silent fallback.

- **Synthetic-run diagnostic proves the written path end-to-end but writes spoken attempts DB-direct** (no real audio upload/transcription). Accepted tradeoff: a real spoken E2E needs a fixture audio upload. Tracked as a follow-up, not a defect.

- **`/storage/objects/*path` serves recordings with authz commented out** — accepted single-user tradeoff matching qr-course; revisit only if multi-user.

- **video-js scaffold tsc noise:** `lib/video/hooks.ts`, `animations.ts`, `main.tsx` have pre-existing `window`/`document`/framer-motion `ease` errors. Scaffold-level, do NOT modify; video artifacts run via Vite, not tsc. Verify your own files are clean via `git diff` instead of chasing these.

- **Assessments are a diagnostic engine scored for COMPLETION, not correctness.** 8 official slots (before/after × 4 units) gate credit (creditMax=20, requiredOfficials=8); only `format:"official"` counts. Answers persist as plain text strings (`answers: string[]`) even for spoken-mode questions — the runner shows a mic prompt and asks the student to capture the gist in text. **Why:** the assessment contract stores text, separate from the heavy AssemblyAI/Anthropic attempt pipeline; don't wire transcription into assessments expecting per-answer grading. **How to apply:** custom builds (`scope:"custom"`) never count toward credit; completing just flips status + stores answers.
