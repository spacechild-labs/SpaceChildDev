import React, { createContext, useContext, useState, useCallback } from "react";
import type { Project, ProjectFile } from "@shared/schema";

interface ProjectContextData {
  currentProject: Project | null;
  projects: Project[];
  currentFile: ProjectFile | null;
  openFiles: ProjectFile[];
  fileContent: string;
  isDirty: boolean;
  
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentFile: (file: ProjectFile | null) => void;
  openFile: (file: ProjectFile) => void;
  closeFile: (fileId: number) => void;
  updateFileContent: (content: string) => void;
  setDirty: (dirty: boolean) => void;
}

const ProjectContext = createContext<ProjectContextData | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const [openFiles, setOpenFiles] = useState<ProjectFile[]>([]);
  const [fileContent, setFileContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const openFile = useCallback((file: ProjectFile) => {
    setOpenFiles((prev) => {
      if (prev.some((f) => f.id === file.id)) {
        return prev;
      }
      return [...prev, file];
    });
    setCurrentFile(file);
    setFileContent(file.content || "");
    setIsDirty(false);
  }, []);

  const closeFile = useCallback((fileId: number) => {
    setOpenFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (currentFile?.id === fileId) {
      setCurrentFile(null);
      setFileContent("");
    }
  }, [currentFile]);

  const updateFileContent = useCallback((content: string) => {
    setFileContent(content);
    setIsDirty(currentFile?.content !== content);
  }, [currentFile]);

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        currentFile,
        openFiles,
        fileContent,
        isDirty,
        setCurrentProject,
        setProjects,
        setCurrentFile,
        openFile,
        closeFile,
        updateFileContent,
        setDirty,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within ProjectProvider");
  }
  return context;
}
