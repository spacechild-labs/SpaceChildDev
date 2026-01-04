import { X } from "lucide-react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { cn } from "@/lib/utils";

export function EditorTabs() {
  const { openFiles, currentFile, setCurrentFile, closeFile, isDirty } = useProjectContext();

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className="h-9 bg-muted/30 border-b flex items-center overflow-x-auto">
      {openFiles.map((file) => {
        const isActive = currentFile?.id === file.id;
        const fileName = file.filePath.split("/").pop();

        return (
          <div
            key={file.id}
            className={cn(
              "group flex items-center gap-2 px-3 h-full border-r cursor-pointer text-sm",
              isActive
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            onClick={() => setCurrentFile(file)}
          >
            <span className="max-w-32 truncate">
              {isDirty && isActive && <span className="text-primary mr-1">●</span>}
              {fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className={cn(
                "w-4 h-4 rounded-sm flex items-center justify-center transition-opacity",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                "hover:bg-muted"
              )}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
