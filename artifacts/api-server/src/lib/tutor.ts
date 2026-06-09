import Anthropic from "@anthropic-ai/sdk";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LectureContext {
  unitNumber: number;
  unitTitle: string | null;
  code: string;
  title: string;
  body: string;
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

function lectureHeader(ctx: LectureContext): string {
  const unit = ctx.unitTitle
    ? `Unit ${ctx.unitNumber} (${ctx.unitTitle})`
    : `Unit ${ctx.unitNumber}`;
  return `${unit}\nLecture ${ctx.code}: ${ctx.title}`;
}

function buildSystem(ctx: LectureContext): string {
  return [
    "You are Coach, a warm, sharp AI tutor inside Podium, a college-level public speaking course.",
    "A student is reading a lecture and can ask you anything — about this lecture, public speaking in general, or loosely related ideas they want to think through out loud. Help them learn and bounce ideas around.",
    "Be encouraging, concrete, and concise. Prefer short paragraphs and the occasional bullet list, in plain language. When the student is vague, either ask one brief clarifying question or offer a useful interpretation and run with it.",
    "Ground your answers in the lecture when it is relevant, but you are free to range beyond it. If a question is truly unrelated to communication, speaking, or learning, answer briefly and gently steer back to the course.",
    "You do NOT have access to the student's own recordings, scores, or assignments — never invent details about those. If asked, explain that grading happens when they submit a response.",
    "Format replies in Markdown.",
    "",
    "LECTURE THE STUDENT IS READING:",
    lectureHeader(ctx),
    "",
    ctx.body,
  ].join("\n");
}

/**
 * Answers a student's tutor question for a given lecture. Throws on any upstream
 * failure (missing key, API error, empty reply) so the route can return a 502.
 */
export async function askLectureTutor(
  ctx: LectureContext,
  messages: TutorMessage[],
): Promise<string> {
  const client = new Anthropic({ apiKey: getApiKey() });

  const conversation = messages
    .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  if (conversation.length === 0) {
    throw new Error("no message to answer");
  }

  const message = await client.messages.create({
    model: getModel(),
    max_tokens: 1024,
    system: buildSystem(ctx),
    messages: conversation,
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error("tutor returned an empty reply");
  }
  return text;
}

/**
 * Generates a short set of clickable starter questions tailored to the lecture.
 * Throws on any upstream failure so the route can return a 502.
 */
export async function suggestLectureQuestions(
  ctx: LectureContext,
): Promise<string[]> {
  const client = new Anthropic({ apiKey: getApiKey() });

  const system = [
    "You write short, enticing starter questions a student might click to ask an AI tutor about a public speaking lecture.",
    "Return ONLY a JSON array of exactly 5 strings — no prose, no numbering, no code fences.",
    "Each string is a first-person question the student could ask, 4-12 words, specific to this lecture, and varied: mix practical how-do-I questions, conceptual why questions, and at least one 'help me practice' style prompt.",
  ].join("\n");

  const user = [lectureHeader(ctx), "", ctx.body].join("\n");

  const message = await client.messages.create({
    model: getModel(),
    max_tokens: 400,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("tutor returned no parseable suggestions");
  }

  const parsed = JSON.parse(text.slice(start, end + 1)) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("tutor suggestions were not an array");
  }

  const suggestions = parsed
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 6);

  if (suggestions.length === 0) {
    throw new Error("tutor produced no usable suggestions");
  }
  return suggestions;
}
