import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  json,
  integer,
} from "drizzle-orm/pg-core";
import { serialize } from "v8";

// User Table (NextAuth / OAuth setup)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
  credits: integer("credits").default(5),
});

// AI Agents Table
export const agentConfig = pgTable("agent_config", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  agentImage: text("agent_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userEmail: varchar("userEmail", { length: 255 })
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
});

// Routines / Scheduled Tasks Table
export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  cron: varchar("cron", { length: 100 }),
  frequency: varchar("frequency", { length: 50 }),
  startDate: timestamp("startDate"),
  agentId: integer("agentId")
    .notNull()
    .references(() => agentConfig.id, { onDelete: "cascade" }),
  requiredTools: json("requiredTools"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Chat History Table
export const chatHistory = pgTable("chatHistory", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId")
    .notNull()
    .references(() => agentConfig.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Routine Execution Logs
export const routineLogs = pgTable("routineLogs", {
  id: serial("id").primaryKey(),
  routineId: integer("routineId")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }),
  result: text("result"),
  executedAt: timestamp("executedAt").defaultNow(),
});

// Types export
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AgentConfig = typeof agentConfig.$inferSelect;
export type NewAgentConfig = typeof agentConfig.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;
export type ChatMessage = typeof chatHistory.$inferSelect;
export type NewChatMessage = typeof chatHistory.$inferInsert;
export type RoutineLog = typeof routineLogs.$inferSelect;
export type NewRoutineLog = typeof routineLogs.$inferInsert;