import { chatJson } from "./ai";

export interface TraceInput {
  keystrokeCount: number;
  eraseCount: number;
  bulkInsertCount?: number;
  longestBulkInsertChars?: number;
  rewriteSegments?: number;
  durationMs: number;
}

export interface DetectionOutcome {
  aiScore: number;
  aiFlagged: boolean;
  diachronicScore: number;
  diachronicFlagged: boolean;
  rationale: string;
}

// Diachronic detection: keystroke pattern shows the user is rewording AI output.
// Signals: huge bulk inserts (paste-like), low keystroke-to-output ratio, very high WPM,
// or many rewrite segments on top of one initial dump.
export function diachronicScore(text: string, trace: TraceInput): number {
  const len = text.length;
  if (len < 8) return 0;

  const ks = trace.keystrokeCount;
  const longest = trace.longestBulkInsertChars ?? 0;
  const bulk = trace.bulkInsertCount ?? 0;
  const duration = Math.max(trace.durationMs, 1);
  const seconds = duration / 1000;
  const charsPerSecond = len / seconds;
  const ratio = ks / len; // typed chars per output char; near-paste -> << 1

  let score = 0;
  // Single bulk insert covering most of the answer is paste-like.
  if (longest > 40 || longest / len > 0.4) score += 0.5;
  if (bulk >= 2 && longest > 25) score += 0.15;
  // Low keystrokes vs output length.
  if (ratio < 0.6 && len > 30) score += 0.3;
  // Unrealistic typing speed.
  if (charsPerSecond > 12 && len > 30) score += 0.2;
  // Rewrite-on-top-of-paste pattern: at least one big bulk insert AND edits.
  if (longest > 30 && (trace.rewriteSegments ?? 0) >= 2) score += 0.15;

  return Math.max(0, Math.min(1, score));
}

// Cheap AI-text detector: looks at structural features common in LLM prose.
// We optionally upgrade with an LLM call.
export function heuristicAiScore(text: string): number {
  const t = text.trim();
  if (t.length < 20) return 0;

  const sentences = t.split(/[.!?]+\s+/).filter((s) => s.length > 0);
  const avgLen =
    sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) /
    Math.max(sentences.length, 1);
  const tellTales = [
    /\bin conclusion\b/i,
    /\bmoreover\b/i,
    /\bfurthermore\b/i,
    /\bit is important to note\b/i,
    /\bdelve\b/i,
    /\btapestry\b/i,
    /\bleverag(e|ing)\b/i,
    /\bnavigat(e|ing) the\b/i,
    /\bplays? a (crucial|vital|pivotal) role\b/i,
  ];
  const hits = tellTales.reduce((n, r) => n + (r.test(t) ? 1 : 0), 0);
  const lenScore = Math.min(1, Math.max(0, (avgLen - 14) / 14));
  const hitScore = Math.min(1, hits / 3);

  return Math.min(1, lenScore * 0.4 + hitScore * 0.5);
}

export async function llmAiScore(text: string): Promise<number | null> {
  const t = text.trim();
  if (t.length < 40) return null;
  try {
    const out = await chatJson<{ probability: number }>(
      "You are a forensic text classifier. Given a short student response, estimate the probability (0-1) that it was produced by a large language model and not handwritten by a college freshman. Respond with strict JSON: {\"probability\": number}. Keep the number between 0 and 1.",
      t,
    );
    if (typeof out.probability === "number") {
      return Math.max(0, Math.min(1, out.probability));
    }
    return null;
  } catch {
    return null;
  }
}

export async function detect(
  text: string,
  trace: TraceInput,
): Promise<DetectionOutcome> {
  const heuristic = heuristicAiScore(text);
  const llm = await llmAiScore(text);
  const aiScore = llm == null ? heuristic : 0.4 * heuristic + 0.6 * llm;
  const diaScore = diachronicScore(text, trace);

  const reasons: string[] = [];
  if (aiScore >= 0.55) reasons.push("Text patterns match common LLM outputs.");
  if (diaScore >= 0.55)
    reasons.push(
      "Keystroke pattern shows large bulk inserts and low typing-to-output ratio, consistent with rewording pasted AI text.",
    );
  if (reasons.length === 0)
    reasons.push("No strong indicators of AI generation or AI rewording.");

  return {
    aiScore: Number(aiScore.toFixed(3)),
    aiFlagged: aiScore >= 0.55,
    diachronicScore: Number(diaScore.toFixed(3)),
    diachronicFlagged: diaScore >= 0.55,
    rationale: reasons.join(" "),
  };
}
