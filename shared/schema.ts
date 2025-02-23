import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  folderId: integer("folder_id")
    .references(() => folders.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Validation schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertFolderSchema = z.object({
  name: z.string().min(1),
});

export const insertNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  folderId: z.number(),
});

// Types for database rows
export type User = typeof users.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type Note = typeof notes.$inferSelect;

// Types for inserts
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
