import { Router, type IRouter } from "express";
import { asc, eq, sql } from "drizzle-orm";
import {
  db,
  speakingTopicsTable,
  speakingLecturesTable,
  speakingAssignmentsTable,
  speakingPromptsTable,
  speakingAttemptsTable,
  speakingResponsesTable,
} from "@workspace/db";
import { chatText, FAST_MODEL } from "../lib/ai";
import { gptzeroAiScore } from "../lib/detection";
import { evaluateResponse } from "../lib/evaluate";

const router: IRouter = Router();

type Step = {
  name: string;
  ok: boolean;
  ms: number;
  detail?: string;
  error?: string;
};

async function run(
  name: string,
  fn: () => Promise<string | void>,
): Promise<Step> {
  const t0 = Date.now();
  try {
    const detail = await fn();
    return { name, ok: true, ms: Date.now() - t0, detail: detail ?? undefined };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { name, ok: false, ms: Date.now() - t0, error: err };
  }
}

// ---------- Diagnostic 1: system checks ----------
router.get("/speaking/diagnostics/system", async (_req, res) => {
  const steps: Step[] = [];

  steps.push(
    await run("Environment: DATABASE_URL present", async () => {
      if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
      return "ok";
    }),
  );

  steps.push(
    await run("Environment: ANTHROPIC_API_KEY present", async () => {
      if (!process.env.ANTHROPIC_API_KEY)
        throw new Error("ANTHROPIC_API_KEY is not set");
      return `model ${process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5"}`;
    }),
  );

  steps.push(
    await run("Environment: ASSEMBLYAI_API_KEY present", async () => {
      if (!process.env.ASSEMBLYAI_API_KEY)
        throw new Error("ASSEMBLYAI_API_KEY is not set");
      return "ok";
    }),
  );

  steps.push(
    await run("Environment: object storage configured", async () => {
      if (!process.env.PRIVATE_OBJECT_DIR)
        throw new Error("PRIVATE_OBJECT_DIR is not set");
      return "ok";
    }),
  );

  steps.push(
    await run("Database: SELECT 1", async () => {
      const r = await db.execute(sql`select 1 as ok`);
      const ok = (r.rows[0] as { ok?: number } | undefined)?.ok;
      if (Number(ok) !== 1) throw new Error("unexpected result");
      return "round-trip ok";
    }),
  );

  steps.push(
    await run("Database: speaking course seeded", async () => {
      const t = await db.select().from(speakingTopicsTable);
      const l = await db.select().from(speakingLecturesTable);
      const a = await db.select().from(speakingAssignmentsTable);
      const p = await db.select().from(speakingPromptsTable);
      if (t.length < 29) throw new Error(`only ${t.length} topics`);
      if (l.length < 1) throw new Error("no lectures");
      if (a.length < 1) throw new Error("no assignments");
      if (p.length < 1) throw new Error("no prompts");
      return `${t.length} topics · ${l.length} lectures · ${a.length} assignments · ${p.length} prompts`;
    }),
  );

  steps.push(
    await run("OpenAI integration: chat completion (fast model)", async () => {
      const txt = await chatText(
        "You answer with a single word only.",
        "Reply with exactly the word PONG.",
        FAST_MODEL,
      );
      if (!txt) throw new Error("empty completion");
      return `responded (${txt.length} chars)`;
    }),
  );

  steps.push(
    await run("Anthropic grader: evaluate a sample written answer", async () => {
      const evaluation = await evaluateResponse({
        mode: "written",
        promptText: "In one sentence, why does eye contact matter when speaking?",
        rubric: null,
        guidance: null,
        targetSeconds: null,
        transcriptOrText:
          "Eye contact matters because it builds trust with the audience and keeps them engaged with the speaker's message.",
        metrics: null,
      });
      if (typeof evaluation.contentScore !== "number")
        throw new Error("no contentScore returned");
      return `contentScore=${evaluation.contentScore} grade=${evaluation.grade}`;
    }),
  );

  steps.push(
    await run("AssemblyAI: API authentication", async () => {
      const apiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!apiKey) throw new Error("ASSEMBLYAI_API_KEY is not set");
      const r = await fetch("https://api.assemblyai.com/v2/transcript?limit=1", {
        headers: { authorization: apiKey },
      });
      if (r.status === 401 || r.status === 403)
        throw new Error(`auth rejected (HTTP ${r.status})`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return "authenticated";
    }),
  );

  steps.push(
    await run("GPTZero: connectivity", async () => {
      if (!process.env.GPTZERO_API_KEY)
        throw new Error("GPTZERO_API_KEY is not set");
      const score = await gptzeroAiScore(
        "This is a representative sample of human-written prose used purely to confirm that the GPTZero classification endpoint is reachable and returning a probability for the supplied document.",
      );
      if (score == null)
        throw new Error("no probability returned (key invalid or endpoint error)");
      return `aiProbability=${score.toFixed(2)}`;
    }),
  );

  const ok = steps.every((s) => s.ok);
  res.json({ ok, generatedAt: new Date().toISOString(), steps });
});

// ---------- Diagnostic 2: synthetic student (written reflection end-to-end) ----------
router.post("/speaking/diagnostics/synthetic-run", async (_req, res) => {
  const steps: Step[] = [];
  res.setTimeout(10 * 60 * 1000);

  let writtenPromptId: number | null = null;
  let assignmentId: number | null = null;
  let attemptId: number | null = null;

  steps.push(
    await run("Load course catalog", async () => {
      const t = await db.select().from(speakingTopicsTable);
      const l = await db.select().from(speakingLecturesTable);
      const a = await db.select().from(speakingAssignmentsTable);
      const p = await db.select().from(speakingPromptsTable);
      return `${t.length} topics · ${l.length} lectures · ${a.length} assignments · ${p.length} prompts`;
    }),
  );

  steps.push(
    await run("Find a written reflection prompt", async () => {
      const written = await db
        .select()
        .from(speakingPromptsTable)
        .where(eq(speakingPromptsTable.mode, "written"))
        .orderBy(asc(speakingPromptsTable.id));
      const prompt = written[0];
      if (!prompt) throw new Error("no written prompt found in seed");
      writtenPromptId = prompt.id;
      assignmentId = prompt.assignmentId;
      return `prompt #${prompt.id} on assignment #${prompt.assignmentId}`;
    }),
  );

  steps.push(
    await run("Start a fresh attempt", async () => {
      if (assignmentId == null) throw new Error("no assignment resolved");
      const [created] = await db
        .insert(speakingAttemptsTable)
        .values({ assignmentId, status: "in_progress" })
        .returning();
      if (!created) throw new Error("could not create attempt");
      attemptId = created.id;
      return `attempt #${created.id}`;
    }),
  );

  steps.push(
    await run("Submit written response → AI grade + feedback", async () => {
      if (attemptId == null || writtenPromptId == null)
        throw new Error("attempt or prompt missing");
      const [prompt] = await db
        .select()
        .from(speakingPromptsTable)
        .where(eq(speakingPromptsTable.id, writtenPromptId));
      if (!prompt) throw new Error("prompt vanished");

      const sampleAnswer =
        "Before I speak, I picture exactly who is in the room: their goals, what they already know, and what would change their mind. I tailor my opening to a concern they actually hold, use one concrete example from their world, and close by asking for a specific next step so the talk earns its place on their calendar.";

      const evaluation = await evaluateResponse({
        mode: "written",
        promptText: prompt.prompt,
        rubric: prompt.rubric,
        guidance: prompt.guidance,
        targetSeconds: prompt.targetSeconds,
        transcriptOrText: sampleAnswer,
        metrics: null,
      });

      const [saved] = await db
        .insert(speakingResponsesTable)
        .values({
          attemptId,
          promptId: writtenPromptId,
          mode: "written",
          status: "graded",
          textAnswer: sampleAnswer,
          contentScore: evaluation.contentScore,
          deliveryScore: evaluation.deliveryScore,
          overallScore: evaluation.overallScore,
          grade: evaluation.grade,
          summary: evaluation.summary,
          whatWorked: evaluation.whatWorked,
          whatToFix: evaluation.whatToFix,
          gradedAt: new Date(),
        })
        .returning();
      if (!saved || saved.status !== "graded")
        throw new Error("response not graded");
      return `grade ${evaluation.grade} · content ${evaluation.contentScore} · ${evaluation.whatToFix.length} fixes`;
    }),
  );

  steps.push(
    await run("Finalize attempt → roll up score", async () => {
      if (attemptId == null) throw new Error("no attempt");
      const responses = await db
        .select()
        .from(speakingResponsesTable)
        .where(eq(speakingResponsesTable.attemptId, attemptId));
      const graded = responses.filter(
        (r) => r.status === "graded" && r.overallScore != null,
      );
      const overallScore =
        graded.length > 0
          ? Math.round(
              (graded.reduce((s, r) => s + (r.overallScore ?? 0), 0) /
                graded.length) *
                100,
            ) / 100
          : null;
      const [updated] = await db
        .update(speakingAttemptsTable)
        .set({ status: "submitted", submittedAt: new Date(), overallScore })
        .where(eq(speakingAttemptsTable.id, attemptId))
        .returning();
      if (!updated || updated.status !== "submitted")
        throw new Error("attempt not submitted");
      if (updated.overallScore == null)
        throw new Error("attempt has no rolled-up score");
      return `attempt submitted · overall ${updated.overallScore}`;
    }),
  );

  steps.push(
    await run("Verify analytics reflect the run", async () => {
      const submitted = await db
        .select()
        .from(speakingAttemptsTable)
        .where(eq(speakingAttemptsTable.status, "submitted"));
      const graded = await db
        .select()
        .from(speakingResponsesTable)
        .where(eq(speakingResponsesTable.status, "graded"));
      if (submitted.length < 1) throw new Error("no submitted attempts visible");
      if (graded.length < 1) throw new Error("no graded responses visible");
      return `${submitted.length} submitted attempts · ${graded.length} graded responses`;
    }),
  );

  steps.push(
    await run("Clean up synthetic attempt", async () => {
      if (attemptId == null) return "nothing to clean";
      await db
        .delete(speakingAttemptsTable)
        .where(eq(speakingAttemptsTable.id, attemptId));
      return `removed attempt #${attemptId} (responses cascade)`;
    }),
  );

  const ok = steps.every((s) => s.ok);
  res.json({ ok, generatedAt: new Date().toISOString(), steps });
});

export default router;
