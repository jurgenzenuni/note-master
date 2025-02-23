import { Router } from "express";
import { storage } from "../storage";
import { insertNoteSchema } from "@shared/schema";

const router = Router();

router.get("/folder/:folderId", async (req, res) => {
  try {
    const folderId = parseInt(req.params.folderId);
    const userId = req.session.userId;

    console.log("Route params:", { folderId, userId });

    if (isNaN(folderId) || !userId) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: {
          folderId: isNaN(folderId) ? "Invalid" : folderId,
          hasUserId: !!userId,
        },
      });
    }

    const notes = await storage.getNotes(folderId, userId);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      error: "Failed to get notes",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const noteData = insertNoteSchema.parse(req.body);
    const note = await storage.createNote(noteData, req.session.userId!);
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: "Invalid note data" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const userId = req.session.userId;

    if (isNaN(noteId) || !userId) {
      return res.status(400).json({
        error: "Invalid parameters",
      });
    }

    const noteData = {
      title: req.body.title,
      content: req.body.content ?? "",
      folderId: req.body.folderId,
    };

    const note = await storage.updateNote(noteId, noteData, userId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/:id", async (req, res) => {
  await storage.deleteNote(parseInt(req.params.id), req.session.userId!);
  res.json({ message: "Note deleted" });
});

router.get("/:id", async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const userId = req.session.userId;

    if (isNaN(noteId) || !userId) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: {
          noteId: isNaN(noteId) ? "Invalid" : noteId,
          hasUserId: !!userId,
        },
      });
    }

    const note = await storage.getNote(noteId, userId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({
      error: "Failed to get note",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
