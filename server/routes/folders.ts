import { Router } from "express";
import { storage } from "../storage";
import { insertFolderSchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  const folders = await storage.getFolders(req.session.userId!);
  res.json(folders);
});

router.post("/", async (req, res) => {
  try {
    const folderData = insertFolderSchema.parse(req.body);
    const folder = await storage.createFolder(folderData, req.session.userId!);
    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: "Invalid folder data" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const folderData = insertFolderSchema.parse(req.body);
    const folder = await storage.updateFolder(
      parseInt(req.params.id),
      folderData,
      req.session.userId!
    );
    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: "Invalid folder data" });
  }
});

router.delete("/:id", async (req, res) => {
  await storage.deleteFolder(parseInt(req.params.id), req.session.userId!);
  res.json({ message: "Folder deleted" });
});

export default router;
