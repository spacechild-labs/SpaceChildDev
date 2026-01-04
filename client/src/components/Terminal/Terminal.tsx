import { useEffect, useRef, useState } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalInstance {
  id: string;
  name: string;
  output: string[];
}

export function Terminal() {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([
    { id: "1", name: "Terminal 1", output: ["Welcome to SpaceChildDev Terminal", ""] }
  ]);
  const [activeTerminal, setActiveTerminal] = useState("1");
  const [input, setInput] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminals]);

  const currentTerminal = terminals.find(t => t.id === activeTerminal);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      const newOutput = [...(currentTerminal?.output || []), `$ ${input}`, `Command: ${input}`];
      setTerminals(prev => 
        prev.map(t => 
          t.id === activeTerminal 
            ? { ...t, output: newOutput }
            : t
        )
      );
      setInput("");
    }
  };

  const addTerminal = () => {
    const newId = String(terminals.length + 1);
    setTerminals(prev => [...prev, {
      id: newId,
      name: `Terminal ${newId}`,
      output: [""]
    }]);
    setActiveTerminal(newId);
  };

  const closeTerminal = (id: string) => {
    if (terminals.length === 1) return;
    setTerminals(prev => prev.filter(t => t.id !== id));
    if (activeTerminal === id) {
      setActiveTerminal(terminals[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Terminal Tabs */}
      <div className="h-8 bg-muted/30 border-b flex items-center justify-between">
        <div className="flex items-center">
          {terminals.map(terminal => (
            <div
              key={terminal.id}
              className={cn(
                "group flex items-center gap-2 px-3 h-full cursor-pointer text-sm border-r",
                activeTerminal === terminal.id
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTerminal(terminal.id)}
            >
              <span>{terminal.name}</span>
              {terminals.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTerminal(terminal.id);
                  }}
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:bg-muted rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTerminal}
            className="px-2 h-full text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="px-2">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-auto p-2 font-mono text-sm"
      >
        {currentTerminal?.output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="flex items-center border-t px-2 py-1">
        <span className="text-primary mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent outline-none text-sm font-mono"
          placeholder="Type a command..."
        />
      </div>
    </div>
  );
}
