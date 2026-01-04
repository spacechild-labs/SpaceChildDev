import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  serial,
  real,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================================================
// Core Tables
// =============================================================================

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"),
  monthlyCredits: integer("monthly_credits").default(100),
  usedCredits: integer("used_credits").default(0),
  creditResetDate: timestamp("credit_reset_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectType: varchar("project_type", { length: 100 }).default("web-app"),
  config: jsonb("config").default("{}"),
  rootPath: varchar("root_path", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  content: text("content"),
  fileType: varchar("file_type", { length: 50 }),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// Agent System Tables
// =============================================================================

export const agentTasks = pgTable("agent_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: integer("project_id").references(() => projects.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  agentType: varchar("agent_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  input: jsonb("input").notNull(),
  output: jsonb("output"),
  costUsd: decimal("cost_usd", { precision: 10, scale: 4 }),
  tokensUsed: integer("tokens_used"),
  modelUsed: varchar("model_used", { length: 100 }),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentDefinitions = pgTable("agent_definitions", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  systemPrompt: text("system_prompt").notNull(),
  tools: jsonb("tools").$type<string[]>().default([]),
  defaultModel: varchar("default_model", { length: 100 }).default("claude-3-5-sonnet"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================================================
// Quality Engineering Tables
// =============================================================================

export const patternBank = pgTable("pattern_bank", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  framework: varchar("framework", { length: 50 }).notNull(),
  patternType: varchar("pattern_type", { length: 100 }).notNull(),
  patternContent: jsonb("pattern_content").notNull(),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  confidence: real("confidence").default(0.5),
  qValue: real("q_value").default(0.0),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learningEpisodes = pgTable("learning_episodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  state: jsonb("state").notNull(),
  action: jsonb("action").notNull(),
  reward: real("reward").notNull(),
  nextState: jsonb("next_state"),
  algorithm: varchar("algorithm", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tddSessions = pgTable("tdd_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentPhase: varchar("current_phase", { length: 20 }).default("red"),
  cycleCount: integer("cycle_count").default(0),
  testFilePath: varchar("test_file_path", { length: 500 }),
  implFilePath: varchar("impl_file_path", { length: 500 }),
  assertions: jsonb("assertions"),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qualityMetrics = pgTable("quality_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  coverage: real("coverage"),
  securityScore: real("security_score"),
  performanceScore: real("performance_score"),
  accessibilityScore: real("accessibility_score"),
  maintainabilityScore: real("maintainability_score"),
  testQualityScore: real("test_quality_score"),
  overallScore: real("overall_score"),
  dimensions: jsonb("dimensions"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const testRuns = pgTable("test_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  framework: varchar("framework", { length: 50 }).notNull(),
  totalTests: integer("total_tests").default(0),
  passedTests: integer("passed_tests").default(0),
  failedTests: integer("failed_tests").default(0),
  skippedTests: integer("skipped_tests").default(0),
  duration: integer("duration"),
  coverage: real("coverage"),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flakyTests = pgTable("flaky_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  testName: varchar("test_name", { length: 500 }).notNull(),
  testPath: varchar("test_path", { length: 500 }).notNull(),
  flakyScore: real("flaky_score").default(0),
  passCount: integer("pass_count").default(0),
  failCount: integer("fail_count").default(0),
  rootCause: text("root_cause"),
  suggestedFix: text("suggested_fix"),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================================================
// AI Provider Usage
// =============================================================================

export const aiProviderUsage = pgTable("ai_provider_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: varchar("provider", { length: 100 }),
  serviceType: varchar("service_type", { length: 100 }),
  tokensUsed: integer("tokens_used"),
  costUsd: decimal("cost_usd", { precision: 10, scale: 4 }),
  requestTimestamp: timestamp("request_timestamp").defaultNow(),
});

// =============================================================================
// Real-Time Events
// =============================================================================

export const agentEvents = pgTable("agent_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => agentTasks.id),
  agentType: varchar("agent_type", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  payload: jsonb("payload"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// =============================================================================
// Relations
// =============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  agentTasks: many(agentTasks),
  aiProviderUsage: many(aiProviderUsage),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  files: many(projectFiles),
  agentTasks: many(agentTasks),
  tddSessions: many(tddSessions),
  qualityMetrics: many(qualityMetrics),
  testRuns: many(testRuns),
  flakyTests: many(flakyTests),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
}));

export const agentTasksRelations = relations(agentTasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [agentTasks.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [agentTasks.userId],
    references: [users.id],
  }),
  events: many(agentEvents),
}));

export const agentEventsRelations = relations(agentEvents, ({ one }) => ({
  task: one(agentTasks, {
    fields: [agentEvents.taskId],
    references: [agentTasks.id],
  }),
}));

export const tddSessionsRelations = relations(tddSessions, ({ one }) => ({
  project: one(projects, {
    fields: [tddSessions.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [tddSessions.userId],
    references: [users.id],
  }),
}));

export const qualityMetricsRelations = relations(qualityMetrics, ({ one }) => ({
  project: one(projects, {
    fields: [qualityMetrics.projectId],
    references: [projects.id],
  }),
}));

export const testRunsRelations = relations(testRuns, ({ one }) => ({
  project: one(projects, {
    fields: [testRuns.projectId],
    references: [projects.id],
  }),
}));

export const flakyTestsRelations = relations(flakyTests, ({ one }) => ({
  project: one(projects, {
    fields: [flakyTests.projectId],
    references: [projects.id],
  }),
}));

// =============================================================================
// Insert Schemas
// =============================================================================

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentTaskSchema = createInsertSchema(agentTasks).omit({
  id: true,
  createdAt: true,
});

export const insertPatternBankSchema = createInsertSchema(patternBank).omit({
  id: true,
  createdAt: true,
});

export const insertLearningEpisodeSchema = createInsertSchema(learningEpisodes).omit({
  id: true,
  createdAt: true,
});

export const insertTddSessionSchema = createInsertSchema(tddSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQualityMetricsSchema = createInsertSchema(qualityMetrics).omit({
  id: true,
  recordedAt: true,
});

export const insertTestRunSchema = createInsertSchema(testRuns).omit({
  id: true,
  createdAt: true,
});

export const insertFlakyTestSchema = createInsertSchema(flakyTests).omit({
  id: true,
  createdAt: true,
});

// =============================================================================
// Types
// =============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
export type AgentDefinition = typeof agentDefinitions.$inferSelect;
export type PatternBank = typeof patternBank.$inferSelect;
export type InsertPatternBank = z.infer<typeof insertPatternBankSchema>;
export type LearningEpisode = typeof learningEpisodes.$inferSelect;
export type InsertLearningEpisode = z.infer<typeof insertLearningEpisodeSchema>;
export type TddSession = typeof tddSessions.$inferSelect;
export type InsertTddSession = z.infer<typeof insertTddSessionSchema>;
export type QualityMetrics = typeof qualityMetrics.$inferSelect;
export type InsertQualityMetrics = z.infer<typeof insertQualityMetricsSchema>;
export type TestRun = typeof testRuns.$inferSelect;
export type InsertTestRun = z.infer<typeof insertTestRunSchema>;
export type FlakyTest = typeof flakyTests.$inferSelect;
export type InsertFlakyTest = z.infer<typeof insertFlakyTestSchema>;
export type AgentEvent = typeof agentEvents.$inferSelect;
