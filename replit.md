# QuantReason

A 4-week Quantitative Reasoning course web app for college freshmen. Single-user (no login), AI-tutored lectures, adaptive practice, AI-graded assignments, and real GPTZero-powered AI-detection on submitted answers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, mounted at `/api`)
- `pnpm --filter @workspace/qr-course run dev` — run the student-facing web app
- `pnpm --filter @workspace/qr-course-demo run dev` — run the screencast-style product demo video
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

### Required env / secrets

- `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)
- `GPTZERO_API_KEY` — GPTZero API key. Required for real AI detection; without it, the detector silently falls back to a heuristic + LLM scorer.
- `SESSION_SECRET` — session signing
- OpenAI access is provided through Replit's AI Integrations proxy — no key needed.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind, generated React Query hooks from the spec
- Demo video: React + framer-motion (screencast-style — rebuilt UI, animated cursor, typed inputs, streaming AI responses)

## Where things live

- **OpenAPI spec (contract source of truth):** `lib/api-spec/openapi.yaml`
- **Generated API hooks + zod:** `lib/api-client-react/src/generated/`, `lib/api-zod/src/generated/`
- **DB schema:** `lib/db/src/schema/course.ts`
- **API routes:** `artifacts/api-server/src/routes/` (course, tutor, practice, assignments, analytics, detection, diagnostics, health)
- **AI detection logic (GPTZero + heuristic + diachronic):** `artifacts/api-server/src/lib/detection.ts`
- **AI client (OpenAI via Replit proxy):** `artifacts/api-server/src/lib/ai.ts`
- **Student app pages:** `artifacts/qr-course/src/pages/` (Dashboard, Week, Lecture, Assignments, Analytics, TopicPractice, Diagnostics)
- **Demo video scenes:** `artifacts/qr-course-demo/src/components/video/video_scenes/`

## Product

QuantReason is a self-paced 4-week QR course. Students:

1. **Read lectures** at Short / Medium / Long granularity (length-toggleable AI-rewritten copy).
2. **Ask a tutor** about any section — answers stream token-by-token.
3. **Practice on this tab** — generated problems per lecture section.
4. **Topic-adaptive practice** — difficulty adjusts based on session accuracy.
5. **Submit homework and tests** — AI grades each answer with feedback, and GPTZero flags AI-generated submissions.
6. **Track progress in Analytics** — KPIs, topic mastery, and recent activity.

### AI detection

Every submitted answer is run through two layers:

- **GPTZero** (`POST https://api.gptzero.me/v2/predict/text`) returns a per-document AI probability. Blended 0.85 × GPTZero + 0.15 × structural heuristic to produce the final `aiScore`.
- **Diachronic detection** scores the keystroke trace (bulk inserts, typing-to-output ratio, sustained WPM, rewrite-on-paste pattern) to catch users who paste AI output and reword it.

Both surface as `aiFlagged` / `diachronicFlagged` booleans plus a human-readable rationale.

## Architecture decisions

- **Contract-first API.** `lib/api-spec/openapi.yaml` is the source of truth; the server validates with generated Zod and the client uses generated React Query hooks. Never hand-write request/response types — regenerate.
- **Single composite logger.** Server code uses `req.log` in routes and the singleton `logger` elsewhere — never `console.log`.
- **GPTZero failure is non-fatal.** If the API key is missing or the call fails, `gptzeroAiScore` returns `null` and detection silently falls back to the LLM/heuristic blend. Submissions never block on detection.
- **Demo video is a real React app, not a slideshow.** The product demo at `/qr-course-demo/` rebuilds the QuantReason UI as live JSX with an animated cursor, character-by-character typing, and token-streaming AI responses — so anyone scrubbing the video sees the actual product behavior.

## User preferences

- Be direct. Skip preamble, apologies, and progress narration. Fix what's asked.
- Don't show marketing reels, kinetic typography headlines, or floating-screenshot compositions when the user asks for a "demo video" — they want a screencast of the actual product.
- Don't ask for confirmation on unambiguous instructions.

## Gotchas

- **Don't edit generated files.** `lib/api-client-react/src/generated/*` and `lib/api-zod/src/generated/*` are overwritten by `pnpm --filter @workspace/api-spec run codegen`. Change the spec, then regenerate.
- **Don't change OpenAPI `info.title`.** It controls generated filenames; renaming it breaks every import.
- **Demo video typecheck noise is pre-existing.** `src/lib/video/animations.ts` and `src/lib/video/hooks.ts` come from the video scaffold and emit harmless `tsc` errors; Vite still serves and exports correctly. Don't "fix" them.
- **Workflows, not `pnpm dev` at root.** Always restart the artifact's workflow (`artifacts/<slug>: web`) — root `pnpm dev` doesn't exist and the artifacts depend on workflow-injected `PORT` / `BASE_PATH`.
- **Demo video export includes the music.** The export path renders `<VideoTemplate />` unmuted; the iframe preview defaults to muted with a `Volume2` toggle.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `video-js` skill for how the demo video, scene controls, and audio wiring work
