import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  folders,
  notes,
  users,
  type Folder,
  type InsertFolder,
  type Note,
  type InsertNote,
} from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Folder operations
  getFolders(userId: number): Promise<Folder[]>;
  getFolder(id: number, userId: number): Promise<Folder | undefined>;
  createFolder(folder: { name: string }, userId: number): Promise<Folder>;
  updateFolder(
    id: number,
    folder: { name: string },
    userId: number
  ): Promise<Folder>;
  deleteFolder(id: number, userId: number): Promise<void>;

  // Note operations
  getNotes(folderId: number, userId: number): Promise<Note[]>;
  getNote(id: number, userId: number): Promise<Note | undefined>;
  createNote(
    note: {
      title: string;
      content?: string;
      folderId: number;
    },
    userId: number
  ): Promise<Note>;
  updateNote(
    id: number,
    note: Partial<{
      title: string;
      content?: string;
      folderId: number;
    }>,
    userId: number
  ): Promise<Note>;
  deleteNote(id: number, userId: number): Promise<void>;

  // User operations
  createUser(
    email: string,
    password: string
  ): Promise<{ id: number; email: string }>;
  validateUser(
    email: string,
    password: string
  ): Promise<{ id: number; email: string } | null>;
}

export class PostgresStorage implements IStorage {
  async getFolders(userId: number) {
    return await db.select().from(folders).where(eq(folders.userId, userId));
  }

  async getFolder(id: number, userId: number) {
    const results = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return results[0];
  }

  async createFolder(folder: { name: string }, userId: number) {
    const results = await db
      .insert(folders)
      .values({
        name: folder.name,
        userId,
      })
      .returning();
    return results[0];
  }

  async updateFolder(id: number, folder: { name: string }, userId: number) {
    const results = await db
      .update(folders)
      .set({
        name: folder.name,
        updatedAt: new Date(),
      })
      .where(and(eq(folders.id, id), eq(folders.userId, userId)))
      .returning();
    return results[0];
  }

  async deleteFolder(id: number, userId: number) {
    await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
  }

  async getNotes(folderId: number, userId: number) {
    try {
      // Validate inputs
      if (!folderId || !userId) {
        throw new Error("Missing required parameters");
      }

      // Log the values for debugging
      console.log("Getting notes for:", { folderId, userId });

      // Ensure we're passing the values correctly
      const results = await db
        .select({
          id: notes.id,
          title: notes.title,
          content: notes.content,
          folderId: notes.folderId,
          userId: notes.userId,
          createdAt: notes.createdAt,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .where(and(eq(notes.folderId, folderId), eq(notes.userId, userId)));

      return results;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async getNote(id: number, userId: number) {
    try {
      if (!id || !userId) {
        throw new Error("Missing required parameters");
      }

      const results = await db
        .select({
          id: notes.id,
          title: notes.title,
          content: notes.content,
          folderId: notes.folderId,
          userId: notes.userId,
          createdAt: notes.createdAt,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .where(and(eq(notes.id, id), eq(notes.userId, userId)));

      return results[0];
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async createNote(
    note: {
      title: string;
      content?: string;
      folderId: number;
    },
    userId: number
  ) {
    const results = await db
      .insert(notes)
      .values({
        title: note.title,
        content: note.content ?? "",
        folderId: note.folderId,
        userId,
      })
      .returning();
    return results[0];
  }

  async updateNote(
    id: number,
    note: Partial<{
      title: string;
      content?: string;
      folderId: number;
    }>,
    userId: number
  ) {
    try {
      if (!id || !userId) {
        throw new Error("Missing required parameters");
      }

      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (note.title !== undefined) updateData.title = note.title;
      if (note.content !== undefined) updateData.content = note.content ?? "";
      if (note.folderId !== undefined) updateData.folderId = note.folderId;

      const results = await db
        .update(notes)
        .set(updateData)
        .where(and(eq(notes.id, id), eq(notes.userId, userId)))
        .returning();

      return results[0];
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async deleteNote(id: number, userId: number) {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  }

  async createUser(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ email, password: hashedPassword })
      .returning({ id: users.id, email: users.email });
    return user;
  }

  async validateUser(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return { id: user.id, email: user.email };
  }
}

export const storage = new PostgresStorage();
