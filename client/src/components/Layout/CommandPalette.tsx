import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { 
  File, 
  Terminal as TerminalIcon, 
  Settings, 
  Bot, 
  TestTube,
  GitBranch,
  Search
} from "lucide-react";

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const commands = [
    { id: "new-file", label: "New File", icon: File, shortcut: "Ctrl+N" },
    { id: "open-file", label: "Open File", icon: File, shortcut: "Ctrl+O" },
    { id: "search", label: "Search in Files", icon: Search, shortcut: "Ctrl+Shift+F" },
    { id: "terminal", label: "Toggle Terminal", icon: TerminalIcon, shortcut: "Ctrl+`" },
    { id: "run-agent", label: "Run Agent", icon: Bot },
    { id: "run-tests", label: "Run Tests", icon: TestTube },
    { id: "git-commit", label: "Git: Commit", icon: GitBranch },
    { id: "settings", label: "Open Settings", icon: Settings, shortcut: "Ctrl+," },
  ];

  const handleSelect = (commandId: string) => {
    console.log("Command selected:", commandId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
        <Command className="bg-card border rounded-lg shadow-2xl overflow-hidden">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="w-full px-4 py-3 bg-transparent border-b text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Commands">
              {commands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={() => handleSelect(command.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-muted data-[selected=true]:bg-muted"
                >
                  <command.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{command.label}</span>
                  {command.shortcut && (
                    <span className="text-xs text-muted-foreground">
                      {command.shortcut}
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </>
  );
}
