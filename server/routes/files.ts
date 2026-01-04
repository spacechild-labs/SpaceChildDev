import { Router } from "express";
import { db } from "../db";
import { projectFiles } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { log } from "../utils/logger";

const router = Router();

// List files for a project
router.get("/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    const files = await db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.projectId, projectId));

    // Build file tree
    const tree = buildFileTree(files);

    res.json({ files, tree });
  } catch (error) {
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Get single file
router.get("/:projectId/:filePath(*)", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const filePath = req.params.filePath;
    
    const [file] = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, projectId),
          eq(projectFiles.filePath, filePath)
        )
      );

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: "Failed to get file" });
  }
});

// Create file
router.post("/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { filePath, content, fileType } = req.body;

    // Check if file already exists
    const [existing] = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, projectId),
          eq(projectFiles.filePath, filePath)
        )
      );

    if (existing) {
      return res.status(409).json({ error: "File already exists" });
    }

    const [file] = await db
      .insert(projectFiles)
      .values({
        projectId,
        filePath,
        content: content || "",
        fileType: fileType || getFileType(filePath),
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    log(`File created: ${filePath}`);
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: "Failed to create file" });
  }
});

// Update file
router.put("/:projectId/:filePath(*)", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const filePath = req.params.filePath;
    const { content } = req.body;

    const [existing] = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, projectId),
          eq(projectFiles.filePath, filePath)
        )
      );

    if (!existing) {
      return res.status(404).json({ error: "File not found" });
    }

    const [file] = await db
      .update(projectFiles)
      .set({
        content,
        version: (existing.version || 1) + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectFiles.projectId, projectId),
          eq(projectFiles.filePath, filePath)
        )
      )
      .returning();

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: "Failed to update file" });
  }
});

// Delete file
router.delete("/:projectId/:filePath(*)", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const filePath = req.params.filePath;

    await db
      .delete(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, projectId),
          eq(projectFiles.filePath, filePath)
        )
      );

    log(`File deleted: ${filePath}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Helper: Build file tree from flat list
function buildFileTree(files: Array<{ filePath: string; id: number }>) {
  const tree: any = {};
  
  for (const file of files) {
    const parts = file.filePath.split("/");
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      
      if (isFile) {
        current[part] = { type: "file", id: file.id, path: file.filePath };
      } else {
        if (!current[part]) {
          current[part] = { type: "directory", children: {} };
        }
        current = current[part].children;
      }
    }
  }
  
  return tree;
}

// Helper: Get file type from extension
function getFileType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    py: "python",
    go: "go",
    rs: "rust",
    yaml: "yaml",
    yml: "yaml",
  };
  return typeMap[ext || ""] || "text";
}

export default router;
