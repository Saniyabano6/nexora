import { pgTable, serial, varchar, text, timestamp, boolean, json, integer } from 'drizzle-orm/pg-core';

// User Table (NextAuth / OAuth setup)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow(),
  credits:integer('credits').default(5)
});

// AI Agents Table
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  instructions: text('instructions'),
  vmEnabled: boolean('vmEnabled').default(false),
  userId: integer('userId').references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow(),
});

// Routines / Scheduled Tasks Table
export const routines = pgTable('routines', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  cron: varchar('cron', { length: 100 }),
  frequency: varchar('frequency', { length: 50 }),
  startDate: timestamp('startDate'),
  agentId: integer('agentId').references(() => agents.id),
  requiredTools: json('requiredTools'),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('createdAt').defaultNow(),
});

// Chat History & Routine Logs Table
export const chatHistory = pgTable('chatHistory', {
  id: serial('id').primaryKey(),
  agentId: integer('agentId').references(() => agents.id),
  role: varchar('role', { length: 50 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

// Routine Execution Logs
export const routineLogs = pgTable('routineLogs', {
  id: serial('id').primaryKey(),
  routineId: integer('routineId').references(() => routines.id),
  status: varchar('status', { length: 50 }),
  result: text('result'),
  executedAt: timestamp('executedAt').defaultNow(),
});

// Types export
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;