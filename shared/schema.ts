import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const docs = pgTable("docs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  format: text("format").notNull().default("md"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

export const insertDocSchema = createInsertSchema(docs).pick({
  title: true,
  content: true,
  format: true,
  created_at: true,
  updated_at: true,
  user_id: true,
});

export type InsertDoc = z.infer<typeof insertDocSchema>;
export type Doc = typeof docs.$inferSelect;

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  analyzed_at: text("analyzed_at").notNull(),
  files_count: integer("files_count").notNull(),
  code_size: integer("code_size").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

export const insertRepoSchema = createInsertSchema(repositories).pick({
  name: true,
  path: true,
  analyzed_at: true,
  files_count: true,
  code_size: true,
  user_id: true,
});

export type InsertRepo = z.infer<typeof insertRepoSchema>;
export type Repository = typeof repositories.$inferSelect;

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  repository_id: integer("repository_id").references(() => repositories.id),
  type: text("type").notNull(), // 'architecture', 'user_stories', 'custom'
  content: text("content").notNull(),
  ai_model: text("ai_model").notNull(),
  created_at: text("created_at").notNull(),
  metadata: jsonb("metadata"),
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  repository_id: true,
  type: true,
  content: true,
  ai_model: true,
  created_at: true,
  metadata: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;
