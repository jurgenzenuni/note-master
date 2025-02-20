import { type Folder, type InsertFolder, type Note, type InsertNote } from "@shared/schema";

export interface IStorage {
  // Folder operations
  getFolders(): Promise<Folder[]>;
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: InsertFolder): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;

  // Note operations
  getNotes(folderId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private folders: Map<number, Folder>;
  private notes: Map<number, Note>;
  private folderId: number;
  private noteId: number;

  constructor() {
    this.folders = new Map();
    this.notes = new Map();
    this.folderId = 1;
    this.noteId = 1;
  }

  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const id = this.folderId++;
    const newFolder = { ...folder, id };
    this.folders.set(id, newFolder);
    return newFolder;
  }

  async updateFolder(id: number, folder: InsertFolder): Promise<Folder> {
    const existing = await this.getFolder(id);
    if (!existing) throw new Error("Folder not found");
    
    const updated = { ...existing, ...folder };
    this.folders.set(id, updated);
    return updated;
  }

  async deleteFolder(id: number): Promise<void> {
    const notes = await this.getNotes(id);
    for (const note of notes) {
      await this.deleteNote(note.id);
    }
    this.folders.delete(id);
  }

  async getNotes(folderId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.folderId === folderId);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.noteId++;
    const newNote = { ...note, id };
    this.notes.set(id, newNote);
    return newNote;
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note> {
    const existing = await this.getNote(id);
    if (!existing) throw new Error("Note not found");
    
    const updated = { ...existing, ...note };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }
}

export const storage = new MemStorage();
