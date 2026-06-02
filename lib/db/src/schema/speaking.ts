import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const speakingTopicsTable = pgTable("speaking_topics", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  unitNumber: integer("unit_number").notNull(),
  blurb: text("blurb"),
  position: integer("position").notNull().default(0),
});

export const speakingLecturesTable = pgTable("speaking_lectures", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => speakingTopicsTable.id, { onDelete: "cascade" }),
  unitNumber: integer("unit_number").notNull(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  position: integer("position").notNull().default(0),
});

export const speakingAssignmentsTable = pgTable("speaking_assignments", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // homework | test | capstone
  title: text("title").notNull(),
  unitNumber: integer("unit_number").notNull(),
  position: integer("position").notNull().default(0),
  instructions: text("instructions"),
});

export const speakingPromptsTable = pgTable("speaking_prompts", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id")
    .notNull()
    .references(() => speakingAssignmentsTable.id, { onDelete: "cascade" }),
  topicId: integer("topic_id").references(() => speakingTopicsTable.id),
  position: integer("position").notNull().default(0),
  mode: text("mode").notNull(), // spoken | written
  prompt: text("prompt").notNull(),
  targetSeconds: integer("target_seconds"),
  rubric: text("rubric"),
  guidance: text("guidance"),
});

export const speakingAttemptsTable = pgTable("speaking_attempts", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id")
    .notNull()
    .references(() => speakingAssignmentsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"), // in_progress | submitted
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  overallScore: doublePrecision("overall_score"),
});

export const speakingResponsesTable = pgTable("speaking_responses", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => speakingAttemptsTable.id, { onDelete: "cascade" }),
  promptId: integer("prompt_id")
    .notNull()
    .references(() => speakingPromptsTable.id, { onDelete: "cascade" }),
  mode: text("mode").notNull(), // spoken | written
  status: text("status").notNull().default("pending"), // pending | graded | failed
  textAnswer: text("text_answer"),
  recordingObjectPath: text("recording_object_path"),
  mediaKind: text("media_kind"), // audio | video
  durationMs: integer("duration_ms"),
  transcript: text("transcript"),
  metrics: jsonb("metrics"),
  contentScore: doublePrecision("content_score"),
  deliveryScore: doublePrecision("delivery_score"),
  overallScore: doublePrecision("overall_score"),
  grade: text("grade"),
  summary: text("summary"),
  whatWorked: jsonb("what_worked"),
  whatToFix: jsonb("what_to_fix"),
  errorMessage: text("error_message"),
  gradedAt: timestamp("graded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
