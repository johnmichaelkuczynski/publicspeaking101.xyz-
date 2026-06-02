import { Router, type IRouter, type Request, type Response } from "express";
import { eq, asc, desc, inArray } from "drizzle-orm";
import {
  db,
  speakingTopicsTable,
  speakingLecturesTable,
  speakingAssignmentsTable,
  speakingPromptsTable,
  speakingAttemptsTable,
  speakingResponsesTable,
} from "@workspace/db";
import {
  GetSpeakingOverviewResponse,
  GetSpeakingUnitResponse,
  GetSpeakingLectureResponse,
  GetSpeakingAssignmentResponse,
  StartSpeakingAttemptResponse,
  ListSpeakingAttemptsResponse,
  GetSpeakingAttemptResponse,
  SubmitSpeakingResponseBody,
  SubmitSpeakingResponseResponse,
  FinalizeSpeakingAttemptResponse,
  GetSpeakingProgressResponse,
} from "@workspace/api-zod";
import { transcribeRecording } from "../lib/speech";
import { evaluateResponse } from "../lib/evaluate";

const router: IRouter = Router();

const UNIT_TITLES: Record<number, { title: string; summary: string }> = {
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

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(value ?? "", 10);
}

type PromptRow = typeof speakingPromptsTable.$inferSelect;
type ResponseRow = typeof speakingResponsesTable.$inferSelect;
type AttemptRow = typeof speakingAttemptsTable.$inferSelect;
type AssignmentRow = typeof speakingAssignmentsTable.$inferSelect;

async function loadPrompts(assignmentId: number) {
  const prompts = await db
    .select()
    .from(speakingPromptsTable)
    .where(eq(speakingPromptsTable.assignmentId, assignmentId))
    .orderBy(asc(speakingPromptsTable.position), asc(speakingPromptsTable.id));

  const topicIds = prompts
    .map((p) => p.topicId)
    .filter((id): id is number => id != null);
  const topics = topicIds.length
    ? await db
        .select()
        .from(speakingTopicsTable)
        .where(inArray(speakingTopicsTable.id, topicIds))
    : [];
  const topicById = new Map(topics.map((t) => [t.id, t]));

  return prompts.map((p) => {
    const topic = p.topicId != null ? topicById.get(p.topicId) : undefined;
    return {
      id: p.id,
      position: p.position,
      mode: p.mode as "spoken" | "written",
      prompt: p.prompt,
      code: topic?.code ?? null,
      topicTitle: topic?.title ?? null,
      targetSeconds: p.targetSeconds ?? null,
      rubric: p.rubric ?? null,
      guidance: p.guidance ?? null,
    };
  });
}

function assignmentMode(prompts: { mode: string }[]): "spoken" | "written" | "mixed" {
  const hasSpoken = prompts.some((p) => p.mode === "spoken");
  const hasWritten = prompts.some((p) => p.mode === "written");
  if (hasSpoken && hasWritten) return "mixed";
  if (hasWritten) return "written";
  return "spoken";
}

function serializeResponse(row: ResponseRow) {
  return {
    id: row.id,
    promptId: row.promptId,
    mode: row.mode as "spoken" | "written",
    status: row.status as "pending" | "graded" | "failed",
    textAnswer: row.textAnswer ?? null,
    recordingObjectPath: row.recordingObjectPath ?? null,
    mediaKind: (row.mediaKind as "audio" | "video" | null) ?? null,
    durationMs: row.durationMs ?? null,
    transcript: row.transcript ?? null,
    metrics: (row.metrics as Record<string, number> | null) ?? null,
    contentScore: row.contentScore ?? null,
    deliveryScore: row.deliveryScore ?? null,
    overallScore: row.overallScore ?? null,
    grade: row.grade ?? null,
    summary: row.summary ?? null,
    whatWorked: (row.whatWorked as string[] | null) ?? [],
    whatToFix: (row.whatToFix as string[] | null) ?? [],
    errorMessage: row.errorMessage ?? null,
    gradedAt: row.gradedAt ? row.gradedAt.toISOString() : null,
  };
}

async function buildAssignmentSummary(a: AssignmentRow) {
  const prompts = await db
    .select({ mode: speakingPromptsTable.mode })
    .from(speakingPromptsTable)
    .where(eq(speakingPromptsTable.assignmentId, a.id));
  const attempts = await db
    .select()
    .from(speakingAttemptsTable)
    .where(eq(speakingAttemptsTable.assignmentId, a.id))
    .orderBy(asc(speakingAttemptsTable.id));
  const submitted = attempts.filter((x) => x.status === "submitted");
  const inProgress = attempts.find((x) => x.status === "in_progress");
  const best = submitted.reduce(
    (b, x) => (x.overallScore != null && x.overallScore > b ? x.overallScore : b),
    -1,
  );
  const status: "not_started" | "in_progress" | "submitted" = inProgress
    ? "in_progress"
    : submitted.length > 0
      ? "submitted"
      : "not_started";
  const last = attempts[attempts.length - 1];
  return {
    id: a.id,
    kind: a.kind as "homework" | "test" | "capstone",
    title: a.title,
    unitNumber: a.unitNumber,
    mode: assignmentMode(prompts),
    promptCount: prompts.length,
    status,
    bestScore: best < 0 ? null : best,
    lastAttemptId: last?.id ?? null,
  };
}

async function buildUnit(unitNumber: number) {
  const lectures = await db
    .select({
      id: speakingLecturesTable.id,
      code: speakingLecturesTable.code,
      title: speakingLecturesTable.title,
    })
    .from(speakingLecturesTable)
    .where(eq(speakingLecturesTable.unitNumber, unitNumber))
    .orderBy(asc(speakingLecturesTable.position), asc(speakingLecturesTable.id));

  const assignments = await db
    .select()
    .from(speakingAssignmentsTable)
    .where(eq(speakingAssignmentsTable.unitNumber, unitNumber))
    .orderBy(asc(speakingAssignmentsTable.position));

  const assignmentSummaries = await Promise.all(
    assignments.map(buildAssignmentSummary),
  );

  const meta = UNIT_TITLES[unitNumber] ?? {
    title: `Unit ${unitNumber}`,
    summary: "",
  };

  return {
    unitNumber,
    title: meta.title,
    summary: meta.summary,
    lectures,
    assignments: assignmentSummaries,
  };
}

async function serializeAttempt(attempt: AttemptRow) {
  const [assignment] = await db
    .select()
    .from(speakingAssignmentsTable)
    .where(eq(speakingAssignmentsTable.id, attempt.assignmentId));
  const prompts = await loadPrompts(attempt.assignmentId);
  const responses = await db
    .select()
    .from(speakingResponsesTable)
    .where(eq(speakingResponsesTable.attemptId, attempt.id))
    .orderBy(asc(speakingResponsesTable.id));

  return {
    id: attempt.id,
    assignmentId: attempt.assignmentId,
    assignmentTitle: assignment?.title ?? null,
    unitNumber: assignment?.unitNumber ?? null,
    kind: assignment?.kind ?? null,
    status: attempt.status as "in_progress" | "submitted",
    overallScore: attempt.overallScore ?? null,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
    prompts,
    responses: responses.map(serializeResponse),
  };
}

router.get("/speaking/overview", async (_req, res) => {
  const units = await Promise.all([1, 2, 3, 4].map(buildUnit));
  const assignmentsTotal = units.reduce((s, u) => s + u.assignments.length, 0);
  const assignmentsCompleted = units.reduce(
    (s, u) => s + u.assignments.filter((a) => a.status === "submitted").length,
    0,
  );
  const allAttempts = await db.select().from(speakingAttemptsTable);

  res.json(
    GetSpeakingOverviewResponse.parse({
      title: "Podium — Public Speaking Studio",
      units,
      totals: {
        assignmentsCompleted,
        assignmentsTotal,
        attemptsCount: allAttempts.length,
      },
    }),
  );
});

router.get("/speaking/units/:unitNumber", async (req, res): Promise<void> => {
  const unitNumber = parseId(req.params.unitNumber);
  if (!Number.isFinite(unitNumber) || unitNumber < 1 || unitNumber > 4) {
    res.status(404).json({ error: "unit not found" });
    return;
  }
  const unit = await buildUnit(unitNumber);
  res.json(GetSpeakingUnitResponse.parse(unit));
});

router.get("/speaking/lectures/:lectureId", async (req, res): Promise<void> => {
  const lectureId = parseId(req.params.lectureId);
  if (!Number.isFinite(lectureId)) {
    res.status(404).json({ error: "lecture not found" });
    return;
  }
  const [lecture] = await db
    .select()
    .from(speakingLecturesTable)
    .where(eq(speakingLecturesTable.id, lectureId));
  if (!lecture) {
    res.status(404).json({ error: "lecture not found" });
    return;
  }
  const meta = UNIT_TITLES[lecture.unitNumber];
  res.json(
    GetSpeakingLectureResponse.parse({
      id: lecture.id,
      unitNumber: lecture.unitNumber,
      code: lecture.code,
      title: lecture.title,
      body: lecture.body,
      unitTitle: meta?.title ?? null,
    }),
  );
});

router.get(
  "/speaking/assignments/:assignmentId",
  async (req, res): Promise<void> => {
    const assignmentId = parseId(req.params.assignmentId);
    if (!Number.isFinite(assignmentId)) {
      res.status(404).json({ error: "assignment not found" });
      return;
    }
    const [assignment] = await db
      .select()
      .from(speakingAssignmentsTable)
      .where(eq(speakingAssignmentsTable.id, assignmentId));
    if (!assignment) {
      res.status(404).json({ error: "assignment not found" });
      return;
    }
    const prompts = await loadPrompts(assignmentId);
    res.json(
      GetSpeakingAssignmentResponse.parse({
        id: assignment.id,
        kind: assignment.kind as "homework" | "test" | "capstone",
        title: assignment.title,
        unitNumber: assignment.unitNumber,
        instructions: assignment.instructions ?? null,
        prompts,
      }),
    );
  },
);

router.post(
  "/speaking/assignments/:assignmentId/start",
  async (req, res): Promise<void> => {
    const assignmentId = parseId(req.params.assignmentId);
    if (!Number.isFinite(assignmentId)) {
      res.status(404).json({ error: "assignment not found" });
      return;
    }
    const [assignment] = await db
      .select()
      .from(speakingAssignmentsTable)
      .where(eq(speakingAssignmentsTable.id, assignmentId));
    if (!assignment) {
      res.status(404).json({ error: "assignment not found" });
      return;
    }

    const existing = await db
      .select()
      .from(speakingAttemptsTable)
      .where(eq(speakingAttemptsTable.assignmentId, assignmentId))
      .orderBy(desc(speakingAttemptsTable.id));
    const resume = existing.find((a) => a.status === "in_progress");

    const attempt =
      resume ??
      (
        await db
          .insert(speakingAttemptsTable)
          .values({ assignmentId })
          .returning()
      )[0]!;

    res.json(StartSpeakingAttemptResponse.parse(await serializeAttempt(attempt)));
  },
);

router.get("/speaking/attempts", async (_req, res) => {
  const attempts = await db
    .select()
    .from(speakingAttemptsTable)
    .orderBy(desc(speakingAttemptsTable.id));
  const assignmentIds = [...new Set(attempts.map((a) => a.assignmentId))];
  const assignments = assignmentIds.length
    ? await db
        .select()
        .from(speakingAssignmentsTable)
        .where(inArray(speakingAssignmentsTable.id, assignmentIds))
    : [];
  const byId = new Map(assignments.map((a) => [a.id, a]));

  const summaries = attempts.map((a) => {
    const assignment = byId.get(a.assignmentId);
    return {
      id: a.id,
      assignmentId: a.assignmentId,
      assignmentTitle: assignment?.title ?? "Assignment",
      unitNumber: assignment?.unitNumber ?? 0,
      kind: assignment?.kind ?? "homework",
      status: a.status as "in_progress" | "submitted",
      overallScore: a.overallScore ?? null,
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
    };
  });

  res.json(ListSpeakingAttemptsResponse.parse(summaries));
});

router.get("/speaking/attempts/:attemptId", async (req, res): Promise<void> => {
  const attemptId = parseId(req.params.attemptId);
  if (!Number.isFinite(attemptId)) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  const [attempt] = await db
    .select()
    .from(speakingAttemptsTable)
    .where(eq(speakingAttemptsTable.id, attemptId));
  if (!attempt) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  res.json(GetSpeakingAttemptResponse.parse(await serializeAttempt(attempt)));
});

router.post(
  "/speaking/attempts/:attemptId/responses",
  async (req: Request, res: Response): Promise<void> => {
    const attemptId = parseId(req.params.attemptId);
    if (!Number.isFinite(attemptId)) {
      res.status(404).json({ error: "attempt not found" });
      return;
    }
    const parsed = SubmitSpeakingResponseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid response body" });
      return;
    }
    const body = parsed.data;

    const [attempt] = await db
      .select()
      .from(speakingAttemptsTable)
      .where(eq(speakingAttemptsTable.id, attemptId));
    if (!attempt) {
      res.status(404).json({ error: "attempt not found" });
      return;
    }

    const [prompt] = await db
      .select()
      .from(speakingPromptsTable)
      .where(eq(speakingPromptsTable.id, body.promptId));
    if (!prompt || prompt.assignmentId !== attempt.assignmentId) {
      res.status(404).json({ error: "prompt not found for this attempt" });
      return;
    }

    if (body.mode === "spoken" && !body.recordingObjectPath) {
      res.status(400).json({ error: "recordingObjectPath is required for spoken responses" });
      return;
    }
    if (body.mode === "written" && !body.textAnswer?.trim()) {
      res.status(400).json({ error: "textAnswer is required for written responses" });
      return;
    }

    // Upsert: remove any prior response for this (attempt, prompt) pair.
    const prior = await db
      .select()
      .from(speakingResponsesTable)
      .where(eq(speakingResponsesTable.attemptId, attemptId));
    const existing = prior.find((r) => r.promptId === body.promptId);
    if (existing) {
      await db
        .delete(speakingResponsesTable)
        .where(eq(speakingResponsesTable.id, existing.id));
    }

    try {
      let transcript: string | null = null;
      let metrics: Record<string, number> | null = null;

      if (body.mode === "spoken") {
        const result = await transcribeRecording(body.recordingObjectPath!);
        transcript = result.transcript;
        metrics = result.metrics as unknown as Record<string, number>;
      }

      const evaluation = await evaluateResponse({
        mode: body.mode,
        promptText: prompt.prompt,
        rubric: prompt.rubric,
        guidance: prompt.guidance,
        targetSeconds: prompt.targetSeconds,
        transcriptOrText:
          body.mode === "spoken" ? (transcript ?? "") : (body.textAnswer ?? ""),
        metrics:
          body.mode === "spoken"
            ? (metrics as unknown as import("../lib/speech").SpeechMetrics)
            : null,
      });

      const [saved] = await db
        .insert(speakingResponsesTable)
        .values({
          attemptId,
          promptId: body.promptId,
          mode: body.mode,
          status: "graded",
          textAnswer: body.mode === "written" ? (body.textAnswer ?? null) : null,
          recordingObjectPath: body.recordingObjectPath ?? null,
          mediaKind: body.mediaKind ?? null,
          durationMs: body.durationMs ?? null,
          transcript,
          metrics,
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

      res.json(SubmitSpeakingResponseResponse.parse(serializeResponse(saved!)));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "evaluation failed";
      req.log.error({ err: error }, "Speaking response evaluation failed");
      await db.insert(speakingResponsesTable).values({
        attemptId,
        promptId: body.promptId,
        mode: body.mode,
        status: "failed",
        textAnswer: body.mode === "written" ? (body.textAnswer ?? null) : null,
        recordingObjectPath: body.recordingObjectPath ?? null,
        mediaKind: body.mediaKind ?? null,
        durationMs: body.durationMs ?? null,
        errorMessage: message,
      });
      res.status(502).json({ error: `Evaluation failed: ${message}` });
    }
  },
);

router.post(
  "/speaking/attempts/:attemptId/submit",
  async (req, res): Promise<void> => {
    const attemptId = parseId(req.params.attemptId);
    if (!Number.isFinite(attemptId)) {
      res.status(404).json({ error: "attempt not found" });
      return;
    }
    const [attempt] = await db
      .select()
      .from(speakingAttemptsTable)
      .where(eq(speakingAttemptsTable.id, attemptId));
    if (!attempt) {
      res.status(404).json({ error: "attempt not found" });
      return;
    }

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

    res.json(
      FinalizeSpeakingAttemptResponse.parse(await serializeAttempt(updated!)),
    );
  },
);

router.get("/speaking/progress", async (_req, res) => {
  const units = await Promise.all([1, 2, 3, 4].map(buildUnit));
  const allAssignments = await db.select().from(speakingAssignmentsTable);
  const attempts = await db.select().from(speakingAttemptsTable);
  const submitted = attempts.filter((a) => a.status === "submitted");

  const totalAssignments = allAssignments.length;
  const completedAssignments = units.reduce(
    (s, u) => s + u.assignments.filter((a) => a.status === "submitted").length,
    0,
  );

  const submittedScores = submitted
    .map((a) => a.overallScore)
    .filter((s): s is number => s != null);
  const averageScore =
    submittedScores.length > 0
      ? Math.round(
          (submittedScores.reduce((s, n) => s + n, 0) /
            submittedScores.length) *
            100,
        ) / 100
      : null;
  const bestScore =
    submittedScores.length > 0 ? Math.max(...submittedScores) : null;

  const allResponses = await db.select().from(speakingResponsesTable);
  const gradedResponses = allResponses.filter((r) => r.status === "graded");
  const contentScores = gradedResponses
    .map((r) => r.contentScore)
    .filter((s): s is number => s != null);
  const deliveryScores = gradedResponses
    .map((r) => r.deliveryScore)
    .filter((s): s is number => s != null);
  const avg = (arr: number[]) =>
    arr.length > 0
      ? Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 100) / 100
      : null;

  const unitProgress = units.map((u) => {
    const submittedInUnit = u.assignments.filter(
      (a) => a.status === "submitted" && a.bestScore != null,
    );
    return {
      unitNumber: u.unitNumber,
      title: u.title,
      completed: u.assignments.filter((a) => a.status === "submitted").length,
      total: u.assignments.length,
      averageScore:
        submittedInUnit.length > 0
          ? Math.round(
              (submittedInUnit.reduce((s, a) => s + (a.bestScore ?? 0), 0) /
                submittedInUnit.length) *
                100,
            ) / 100
          : null,
    };
  });

  const assignmentById = new Map(allAssignments.map((a) => [a.id, a]));
  const recent = submitted
    .sort(
      (a, b) =>
        (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0),
    )
    .slice(0, 10)
    .map((a) => {
      const assignment = assignmentById.get(a.assignmentId);
      return {
        id: a.id,
        title: assignment?.title ?? "Assignment",
        kind: assignment?.kind ?? "homework",
        at: (a.submittedAt ?? a.startedAt).toISOString(),
        score: a.overallScore ?? null,
        unitNumber: assignment?.unitNumber ?? null,
      };
    });

  res.json(
    GetSpeakingProgressResponse.parse({
      totalAssignments,
      completedAssignments,
      totalAttempts: attempts.length,
      averageScore,
      averageContent: avg(contentScores),
      averageDelivery: avg(deliveryScores),
      bestScore,
      units: unitProgress,
      recent,
    }),
  );
});

export default router;
