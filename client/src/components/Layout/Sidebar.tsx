import { useState } from "react";
import { 
  FolderTree, 
  Search, 
  Bot, 
  GitBranch, 
  Settings,
  ChevronRight,
  ChevronDown,
  File,
  Folder
} from "lucide-react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { cn } from "@/lib/utils";

type SidebarTab = "files" | "search" | "agents" | "git" | "settings";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("files");
  const { currentProject } = useProjectContext();

  const tabs = [
    { id: "files" as const, icon: FolderTree, label: "Explorer" },
    { id: "search" as const, icon: Search, label: "Search" },
    { id: "agents" as const, icon: Bot, label: "Agents" },
    { id: "git" as const, icon: GitBranch, label: "Git" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <div className="h-full flex">
      {/* Tab Bar */}
      <div className="w-12 bg-muted/50 border-r flex flex-col items-center py-2 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
              activeTab === tab.id
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={tab.label}
          >
            <tab.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "files" && <FileExplorer />}
        {activeTab === "search" && <SearchPanel />}
        {activeTab === "agents" && <AgentsPanel />}
        {activeTab === "git" && <GitPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
}

function FileExplorer() {
  const { currentProject } = useProjectContext();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Mock file tree for now
  const mockTree = [
    {
      name: "src",
      type: "folder",
      children: [
        { name: "App.tsx", type: "file" },
        { name: "main.tsx", type: "file" },
        { name: "index.css", type: "file" },
      ],
    },
    { name: "package.json", type: "file" },
    { name: "tsconfig.json", type: "file" },
  ];

  const renderNode = (node: any, path: string = "") => {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(fullPath);

    if (node.type === "folder") {
      return (
        <div key={fullPath}>
          <button
            onClick={() => toggleFolder(fullPath)}
            className="flex items-center gap-1 w-full px-2 py-1 hover:bg-muted rounded text-sm"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Folder className="w-4 h-4 text-yellow-500" />
            <span>{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div className="ml-4">
              {node.children.map((child: any) => renderNode(child, fullPath))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={fullPath}
        className="flex items-center gap-1 w-full px-2 py-1 hover:bg-muted rounded text-sm ml-5"
      >
        <File className="w-4 h-4 text-muted-foreground" />
        <span>{node.name}</span>
      </button>
    );
  };

  return (
    <div className="p-2">
      <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
        {currentProject?.name || "EXPLORER"}
      </div>
      <div className="space-y-1">
        {mockTree.map((node) => renderNode(node))}
      </div>
    </div>
  );
}

function SearchPanel() {
  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search files..."
        className="w-full px-3 py-2 rounded bg-muted border border-input text-sm"
      />
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Type to search across files
      </p>
    </div>
  );
}

function AgentsPanel() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Active Agents</h3>
      <p className="text-sm text-muted-foreground">
        No agents currently running
      </p>
    </div>
  );
}

function GitPanel() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Source Control</h3>
      <p className="text-sm text-muted-foreground">
        No repository open
      </p>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Settings</h3>
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm">
          <span>Theme</span>
          <select className="bg-muted border rounded px-2 py-1 text-sm">
            <option>Dark</option>
            <option>Light</option>
            <option>System</option>
          </select>
        </label>
      </div>
    </div>
  );
}
