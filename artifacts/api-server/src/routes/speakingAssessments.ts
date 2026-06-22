import { Router, type IRouter, type Request, type Response } from "express";
import { eq, asc, desc } from "drizzle-orm";
import { db, speakingAssessmentsTable } from "@workspace/db";
import {
  GetSpeakingAssessmentsResponse,
  StartSpeakingAssessmentBody,
  StartSpeakingAssessmentResponse,
  BuildSpeakingAssessmentBody,
  BuildSpeakingAssessmentResponse,
  GetSpeakingAssessmentResponse,
  CompleteSpeakingAssessmentBody,
  CompleteSpeakingAssessmentResponse,
  TranscribeAssessmentRecordingBody,
  TranscribeAssessmentRecordingResponse,
} from "@workspace/api-zod";
import {
  generateAssessmentQuestions,
  type AssessmentFormat,
} from "../lib/assessments";
import { buildProfileContext } from "../lib/profile";
import { transcribeRecording } from "../lib/speech";

const router: IRouter = Router();

type AssessmentRow = typeof speakingAssessmentsTable.$inferSelect;

const UNIT_META: Record<number, { title: string; summary: string }> = {
  1: {
    title: "Unit 1 — Foundations of speaking with confidence",
    summary:
      "Managing nerves, breath and projection, posture and presence, finding your authentic voice, and analyzing your audience before you ever open your mouth.",
  },
  2: {
    title: "Unit 2 — Structuring a message that lands",
    summary:
      "Openings that hook, clear throughlines and signposting, evidence and storytelling, transitions, and closings that stick.",
  },
  3: {
    title: "Unit 3 — Delivery and presence",
    summary:
      "Pace and the power of the pause, vocal variety and emphasis, eliminating filler words, body language and gesture, handling questions, and rehearsal technique.",
  },
  4: {
    title: "Unit 4 — Persuasion, occasion, and the capstone",
    summary:
      "Persuasive appeals, speaking to persuade vs. inform, adapting to the occasion, impromptu speaking, and a full capstone speech.",
  },
};

const UNITS = [1, 2, 3, 4];
const FORMATS: AssessmentFormat[] = ["spoken", "written", "hybrid", "official"];

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(value ?? "", 10);
}

function formatLabel(format: string): string {
  switch (format) {
    case "spoken":
      return "Spoken";
    case "written":
      return "Written";
    case "hybrid":
      return "Hybrid";
    case "official":
      return "Official";
    default:
      return format;
  }
}

interface QuestionShape {
  prompt: string;
  mode: "spoken" | "written";
  hint: string | null;
}

function serializeQuestions(value: unknown): QuestionShape[] {
  if (!Array.isArray(value)) return [];
  return value.map((q) => {
    const item = q as { prompt?: unknown; mode?: unknown; hint?: unknown };
    return {
      prompt: typeof item.prompt === "string" ? item.prompt : "",
      mode: item.mode === "written" ? "written" : "spoken",
      hint: typeof item.hint === "string" ? item.hint : null,
    };
  });
}

function serializeAnswers(value: unknown): (string | null)[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((a) => (typeof a === "string" ? a : null));
}

function serializeAssessment(row: AssessmentRow) {
  const unitTitle =
    row.unitNumber != null ? (UNIT_META[row.unitNumber]?.title ?? null) : null;
  return {
    id: row.id,
    slotKey: row.slotKey,
    scope: row.scope as "before" | "after" | "custom",
    unitNumber: row.unitNumber ?? null,
    unitTitle,
    format: row.format as AssessmentFormat,
    isOfficial: row.isOfficial === 1,
    title: row.title,
    request: row.request ?? null,
    status: row.status as "in_progress" | "completed",
    questions: serializeQuestions(row.questions),
    answers: serializeAnswers(row.answers),
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  };
}

/**
 * The diagnostic assessment plan: 8 slots (Before + After for each of the 4
 * units), each offering four formats, plus completion credit and any custom
 * builds. Completing the "official" format of each slot drives credit.
 */
router.get("/speaking/assessments", async (_req: Request, res: Response) => {
  const all = await db
    .select()
    .from(speakingAssessmentsTable)
    .orderBy(desc(speakingAssessmentsTable.id));

  const latestByKeyFormat = new Map<string, AssessmentRow>();
  for (const row of all) {
    const key = `${row.slotKey}::${row.format}`;
    if (!latestByKeyFormat.has(key)) latestByKeyFormat.set(key, row);
  }

  const slots = [];
  let completedOfficials = 0;
  for (const scope of ["before", "after"] as const) {
    for (const unit of UNITS) {
      const slotKey = `${scope}-${unit}`;
      const meta = UNIT_META[unit];
      const formats = FORMATS.map((format) => {
        const latest = latestByKeyFormat.get(`${slotKey}::${format}`);
        const status = latest
          ? (latest.status as "in_progress" | "completed")
          : ("not_started" as const);
        if (format === "official" && status === "completed") {
          completedOfficials += 1;
        }
        return {
          format,
          isOfficial: format === "official",
          status,
          lastAssessmentId: latest?.id ?? null,
          completedAt: latest?.completedAt
            ? latest.completedAt.toISOString()
            : null,
        };
      });
      slots.push({
        key: slotKey,
        scope,
        unitNumber: unit,
        unitTitle: meta?.title ?? null,
        title: `${scope === "before" ? "Before" : "After"} — ${meta?.title ?? `Unit ${unit}`}`,
        formats,
      });
    }
  }

  const requiredOfficials = UNITS.length * 2;
  const creditMax = 20;
  const creditPercent =
    Math.round((completedOfficials / requiredOfficials) * creditMax * 100) / 100;

  const customAssessments = all
    .filter((r) => r.scope === "custom")
    .map((r) => ({
      id: r.id,
      title: r.title,
      format: r.format as AssessmentFormat,
      request: r.request ?? null,
      status: r.status as "in_progress" | "completed",
      questionCount: serializeQuestions(r.questions).length,
      createdAt: r.createdAt.toISOString(),
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    }));

  const body = GetSpeakingAssessmentsResponse.parse({
    slots,
    credit: {
      completedOfficials,
      requiredOfficials,
      creditPercent,
      creditMax,
    },
    customAssessments,
  });
  res.json(body);
});

/**
 * Starts (or retakes) a diagnostic slot in a chosen format with fresh
 * AI-generated questions. Fails loud with a 502 if generation fails.
 */
router.post(
  "/speaking/assessments/start",
  async (req: Request, res: Response) => {
    const parsed = StartSpeakingAssessmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: "Invalid request body." } });
      return;
    }
    const { slotKey, scope, format } = parsed.data;
    const unitNumber = parsed.data.unitNumber ?? null;

    try {
      const meta = unitNumber != null ? UNIT_META[unitNumber] : undefined;
      const questions = await generateAssessmentQuestions({
        scope,
        format: format as AssessmentFormat,
        unitNumber,
        unitTitle: meta?.title ?? null,
        unitSummary: meta?.summary ?? null,
        request: null,
        profileContext: await buildProfileContext(),
      });

      const title = `${scope === "before" ? "Before" : "After"} — ${meta?.title ?? `Unit ${unitNumber ?? ""}`} (${formatLabel(format)})`;

      const [row] = await db
        .insert(speakingAssessmentsTable)
        .values({
          slotKey,
          scope,
          unitNumber,
          format,
          isOfficial: format === "official" ? 1 : 0,
          title,
          request: null,
          questions,
          answers: null,
          status: "in_progress",
        })
        .returning();

      const body = StartSpeakingAssessmentResponse.parse(
        serializeAssessment(row!),
      );
      res.json(body);
    } catch (err) {
      req.log.error({ err }, "start assessment failed");
      res
        .status(502)
        .json({ error: { message: "Failed to generate the assessment." } });
    }
  },
);

/**
 * Builds a custom assessment from a free-text request with fresh questions.
 * Custom assessments are never official and do not contribute to credit.
 */
router.post(
  "/speaking/assessments/build",
  async (req: Request, res: Response) => {
    const parsed = BuildSpeakingAssessmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: "Invalid request body." } });
      return;
    }
    const request = parsed.data.request.trim();
    if (!request) {
      res.status(400).json({ error: { message: "Request cannot be empty." } });
      return;
    }
    const format = (parsed.data.format ?? "hybrid") as AssessmentFormat;

    try {
      const questions = await generateAssessmentQuestions({
        scope: "custom",
        format,
        unitNumber: null,
        unitTitle: null,
        unitSummary: null,
        request,
        profileContext: await buildProfileContext(),
      });

      const title =
        request.length > 60 ? `${request.slice(0, 57)}...` : request;

      const [row] = await db
        .insert(speakingAssessmentsTable)
        .values({
          slotKey: "custom",
          scope: "custom",
          unitNumber: null,
          format,
          isOfficial: 0,
          title,
          request,
          questions,
          answers: null,
          status: "in_progress",
        })
        .returning();

      const body = BuildSpeakingAssessmentResponse.parse(
        serializeAssessment(row!),
      );
      res.json(body);
    } catch (err) {
      req.log.error({ err }, "build assessment failed");
      res
        .status(502)
        .json({ error: { message: "Failed to build the assessment." } });
    }
  },
);

/** Fetches one assessment instance with its questions and answers. */
router.get(
  "/speaking/assessments/:assessmentId",
  async (req: Request, res: Response) => {
    const id = parseId(req.params.assessmentId);
    if (!Number.isFinite(id)) {
      res.status(404).json({ error: { message: "Assessment not found." } });
      return;
    }
    const [row] = await db
      .select()
      .from(speakingAssessmentsTable)
      .where(eq(speakingAssessmentsTable.id, id));
    if (!row) {
      res.status(404).json({ error: { message: "Assessment not found." } });
      return;
    }
    const body = GetSpeakingAssessmentResponse.parse(serializeAssessment(row));
    res.json(body);
  },
);

/**
 * Records the student's answers and marks an assessment complete. Diagnostics
 * are scored for COMPLETION, not correctness — completing earns credit.
 */
router.post(
  "/speaking/assessments/:assessmentId/complete",
  async (req: Request, res: Response) => {
    const id = parseId(req.params.assessmentId);
    if (!Number.isFinite(id)) {
      res.status(404).json({ error: { message: "Assessment not found." } });
      return;
    }
    const parsed = CompleteSpeakingAssessmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: "Invalid request body." } });
      return;
    }

    const [existing] = await db
      .select()
      .from(speakingAssessmentsTable)
      .where(eq(speakingAssessmentsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: { message: "Assessment not found." } });
      return;
    }

    const questions = serializeQuestions(existing.questions);
    const answers = parsed.data.answers.map((a) =>
      typeof a === "string" ? a : null,
    );

    // Diagnostics are scored for COMPLETION — so completing genuinely requires
    // one non-empty answer per question. Reject partial/mismatched payloads so
    // credit can never be earned without actually finishing the assessment.
    if (answers.length !== questions.length) {
      res.status(400).json({
        error: {
          message: `Expected ${questions.length} answers, received ${answers.length}.`,
        },
      });
      return;
    }
    const allAnswered = answers.every(
      (a) => typeof a === "string" && a.trim().length > 0,
    );
    if (!allAnswered) {
      res.status(400).json({
        error: {
          message: "Every question must be answered before completing.",
        },
      });
      return;
    }

    const [row] = await db
      .update(speakingAssessmentsTable)
      .set({
        answers,
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(speakingAssessmentsTable.id, id))
      .returning();

    const body = CompleteSpeakingAssessmentResponse.parse(
      serializeAssessment(row!),
    );
    res.json(body);
  },
);

/**
 * POST /speaking/assessments/transcribe
 *
 * Transcribes an uploaded spoken answer so it can become the question's text
 * answer. Fail-loud: any transcription failure returns 502 rather than a
 * fabricated transcript, mirroring the attempt grading pipeline.
 */
router.post(
  "/speaking/assessments/transcribe",
  async (req: Request, res: Response) => {
    const parsed = TranscribeAssessmentRecordingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { message: "Invalid request body." } });
      return;
    }

    try {
      const { transcript } = await transcribeRecording(parsed.data.objectPath);
      const body = TranscribeAssessmentRecordingResponse.parse({ transcript });
      res.json(body);
    } catch (error) {
      req.log.error({ err: error }, "Assessment transcription failed");
      res.status(502).json({
        error: {
          message:
            "Could not transcribe your recording. Please try recording again.",
        },
      });
    }
  },
);

export default router;
