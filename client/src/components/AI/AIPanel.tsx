import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Play, Square } from "lucide-react";
import { useAgentContext } from "@/contexts/AgentContext";
import { QE_AGENTS, TDD_SUBAGENTS } from "@shared/types/agent.types";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with code generation, testing, and quality engineering. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeTasks, executeAgent, taskHistory } = useAgentContext();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want help with: "${input}". Let me analyze this and suggest the best approach. Would you like me to run a specific agent or generate some code?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              message.role === "user" ? "bg-primary" : "bg-muted"
            )}>
              {message.role === "user" ? (
                <User className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-lg p-3",
              message.role === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="border-t p-2 bg-muted/30">
          <div className="text-xs font-semibold mb-1">Running Agents</div>
          {activeTasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 text-sm py-1">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="flex-1 truncate">{task.agentType}</span>
              {task.progress !== undefined && (
                <span className="text-muted-foreground">{task.progress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t p-2 bg-muted/30">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => executeAgent("qe-test-generator", {})}
            className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted-foreground/20"
          >
            Generate Tests
          </button>
          <button
            onClick={() => executeAgent("qe-coverage-analyzer", {})}
            className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted-foreground/20"
          >
            Analyze Coverage
          </button>
          <button
            onClick={() => executeAgent("qe-security-scanner", {})}
            className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted-foreground/20"
          >
            Security Scan
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
