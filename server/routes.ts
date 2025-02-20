import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFolderSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Folder routes
  app.get("/api/folders", async (req, res) => {
    const folders = await storage.getFolders();
    res.json(folders);
  });

  app.post("/api/folders", async (req, res) => {
    const folder = insertFolderSchema.parse(req.body);
    const created = await storage.createFolder(folder);
    res.json(created);
  });

  app.patch("/api/folders/:id", async (req, res) => {
    const id = z.number().parse(parseInt(req.params.id));
    const folder = insertFolderSchema.parse(req.body);
    const updated = await storage.updateFolder(id, folder);
    res.json(updated);
  });

  app.delete("/api/folders/:id", async (req, res) => {
    const id = z.number().parse(parseInt(req.params.id));
    await storage.deleteFolder(id);
    res.json({ success: true });
  });

  // Note routes
  app.get("/api/folders/:folderId/notes", async (req, res) => {
    const folderId = z.number().parse(parseInt(req.params.folderId));
    const notes = await storage.getNotes(folderId);
    res.json(notes);
  });

  app.get("/api/notes/:id", async (req, res) => {
    const id = z.number().parse(parseInt(req.params.id));
    const note = await storage.getNote(id);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.json(note);
  });

  app.post("/api/notes", async (req, res) => {
    const note = insertNoteSchema.parse(req.body);
    const created = await storage.createNote(note);
    res.json(created);
  });

  app.patch("/api/notes/:id", async (req, res) => {
    const id = z.number().parse(parseInt(req.params.id));
    const note = insertNoteSchema.partial().parse(req.body);
    const updated = await storage.updateNote(id, note);
    res.json(updated);
  });

  app.delete("/api/notes/:id", async (req, res) => {
    const id = z.number().parse(parseInt(req.params.id));
    await storage.deleteNote(id);
    res.json({ success: true });
  });

  return createServer(app);
}