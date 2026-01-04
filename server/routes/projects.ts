import { Router } from "express";
import { db } from "../db";
import { projects, projectFiles } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { log } from "../utils/logger";

const router = Router();

// List projects
router.get("/", async (req, res) => {
  try {
    const userId = req.session?.userId || "anonymous";
    
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));

    res.json({ projects: userProjects });
  } catch (error) {
    res.status(500).json({ error: "Failed to list projects" });
  }
});

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to get project" });
  }
});

// Create project
router.post("/", async (req, res) => {
  try {
    const userId = req.session?.userId || "anonymous";
    const { name, description, projectType, config } = req.body;

    const [project] = await db
      .insert(projects)
      .values({
        userId,
        name,
        description,
        projectType: projectType || "web-app",
        config: config || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    log(`Project created: ${project.id} - ${name}`);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { name, description, projectType, config } = req.body;

    const [project] = await db
      .update(projects)
      .set({
        name,
        description,
        projectType,
        config,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    // Delete project files first
    await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));
    
    // Delete project
    await db.delete(projects).where(eq(projects.id, projectId));

    log(`Project deleted: ${projectId}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
