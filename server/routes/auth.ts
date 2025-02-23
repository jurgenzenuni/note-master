import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

const router = Router();

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({ id: req.session.userId });
});

router.post("/register", async (req, res) => {
  try {
    const { email, password } = insertUserSchema.parse(req.body);
    const user = await storage.createUser(email, password);

    // Set user session
    req.session.userId = user.id;

    res.json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(400).json({ error: "Invalid registration data" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await storage.validateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Set user session
    req.session.userId = user.id;

    res.json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(400).json({ error: "Invalid login data" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
