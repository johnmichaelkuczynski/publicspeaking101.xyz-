import Anthropic from "@anthropic-ai/sdk";
import type { SpeechMetrics } from "./speech";

export interface EvaluationResult {
  contentScore: number;
  deliveryScore: number | null;
  overallScore: number;
  grade: string;
  summary: string;
  whatWorked: string[];
  whatToFix: string[];
}

export interface EvaluateInput {
  mode: "spoken" | "written";
  promptText: string;
  rubric?: string | null;
  guidance?: string | null;
  targetSeconds?: number | null;
  transcriptOrText: string;
  metrics?: SpeechMetrics | null;
}

function getApiKey(): string {
  const key = process.env["ANTHROPIC_API_KEY"];
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return key;
}

function getModel(): string {
  return process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-4-5";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function letterGrade(score: number): string {
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 60) return "D";
  return "F";
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Evaluator returned no parseable JSON");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .slice(0, 6);
}

function buildUserMessage(input: EvaluateInput): string {
  const parts: string[] = [];
  parts.push(`PROMPT:\n${input.promptText}`);
  if (input.rubric) parts.push(`RUBRIC:\n${input.rubric}`);
  if (input.guidance) parts.push(`GUIDANCE:\n${input.guidance}`);
  if (input.targetSeconds) {
    parts.push(`TARGET LENGTH: about ${input.targetSeconds} seconds`);
  }

  if (input.mode === "spoken" && input.metrics) {
    const m = input.metrics;
    parts.push(
      [
        "DELIVERY METRICS (measured from the audio):",
        `- duration: ${m.durationSeconds}s`,
        `- words: ${m.wordCount}`,
        `- pace: ${m.wordsPerMinute} words/min (conversational target ~110-160)`,
        `- filler words: ${m.fillerCount} (${m.fillerRate} per 100 words)`,
        `- pauses over 0.6s: ${m.pauseCount}; longest pause: ${m.longestPauseMs}ms`,
        `- fluency proxy: ${m.fluencyScore}/100`,
        `- pace-variation proxy: ${m.vocalVarietyScore}/100`,
      ].join("\n"),
    );
    parts.push(`TRANSCRIPT OF THE SPOKEN RESPONSE:\n${input.transcriptOrText}`);
  } else {
    parts.push(`STUDENT RESPONSE:\n${input.transcriptOrText}`);
  }

  return parts.join("\n\n");
}

/**
 * Evaluates a student response with Anthropic. Throws on any upstream failure
 * (missing key, API error, unparseable output) so the route can return a 502
 * instead of inventing a grade.
 */
export async function evaluateResponse(
  input: EvaluateInput,
): Promise<EvaluationResult> {
  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });

  const isSpoken = input.mode === "spoken";

  const system = [
    "You are an experienced public-speaking coach grading a college student's response in a four-unit public speaking course.",
    "Grade fairly but with encouragement. Be concrete and specific — reference what the student actually said.",
    isSpoken
      ? "Score CONTENT (structure, clarity, argument, relevance to the prompt) and DELIVERY (pace, fluency, filler words, pauses, vocal energy) separately, each 0-100. Use the measured delivery metrics as evidence but apply judgment from the transcript too. Note that the pace-variation proxy is only a rough stand-in for vocal variety."
      : "This is a WRITTEN response, so judge CONTENT only (structure, clarity, argument, relevance). Set deliveryScore to null.",
    "Respond with ONLY a JSON object, no prose, with exactly these keys:",
    '{ "contentScore": number 0-100, "deliveryScore": number 0-100 or null, "summary": string (2-3 sentences), "whatWorked": string[] (2-4 concrete strengths), "whatToFix": string[] (2-4 concrete, actionable fixes) }',
  ].join("\n");

  const message = await client.messages.create({
    model: getModel(),
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const parsed = extractJson(text) as {
    contentScore?: unknown;
    deliveryScore?: unknown;
    summary?: unknown;
    whatWorked?: unknown;
    whatToFix?: unknown;
  };

  const contentScore = clamp(Number(parsed.contentScore) || 0, 0, 100);

  let deliveryScore: number | null = null;
  if (isSpoken) {
    const raw = Number(parsed.deliveryScore);
    deliveryScore = Number.isFinite(raw) ? clamp(raw, 0, 100) : 0;
  }

  const overallScore =
    isSpoken && deliveryScore != null
      ? Math.round((contentScore * 0.5 + deliveryScore * 0.5) * 100) / 100
      : contentScore;

  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim().length > 0
      ? parsed.summary.trim()
      : "Response evaluated.";

  return {
    contentScore,
    deliveryScore,
    overallScore,
    grade: letterGrade(overallScore),
    summary,
    whatWorked: toStringArray(parsed.whatWorked),
    whatToFix: toStringArray(parsed.whatToFix),
  };
}
