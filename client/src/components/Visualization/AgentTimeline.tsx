import { useState } from "react";
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  type: "task_started" | "task_completed" | "task_failed" | "task_progress";
  agentType: string;
  timestamp: Date;
  duration?: number;
  details?: {
    progress?: number;
    output?: unknown;
    error?: string;
  };
}

interface AgentTimelineProps {
  events: TimelineEvent[];
  className?: string;
  maxEvents?: number;
}

export function AgentTimeline({ 
  events, 
  className,
  maxEvents = 50 
}: AgentTimelineProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const displayedEvents = events.slice(0, maxEvents);

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "task_started":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "task_completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "task_failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "task_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bot className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "task_started":
        return "border-blue-500";
      case "task_completed":
        return "border-green-500";
      case "task_failed":
        return "border-red-500";
      case "task_progress":
        return "border-yellow-500";
      default:
        return "border-muted";
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getAgentDisplayName = (agentType: string) => {
    return agentType
      .replace(/^qe-/, "")
      .replace(/^tdd-/, "TDD: ")
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (events.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-muted-foreground", className)}>
        <Bot className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">No agent activity yet</p>
        <p className="text-xs">Events will appear here as agents execute</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 p-2", className)}>
      {displayedEvents.map((event, index) => {
        const isExpanded = expandedEvents.has(event.id);
        const hasDetails = event.details && 
          (event.details.output || event.details.error || event.details.progress !== undefined);

        return (
          <div
            key={event.id}
            className={cn(
              "relative pl-6 pb-4",
              index < displayedEvents.length - 1 && "border-l-2 border-muted ml-2"
            )}
          >
            {/* Timeline dot */}
            <div className={cn(
              "absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2",
              getEventColor(event.type)
            )}>
              <div className="absolute inset-0 flex items-center justify-center">
                {getEventIcon(event.type)}
              </div>
            </div>

            {/* Event content */}
            <div 
              className={cn(
                "bg-muted/30 rounded-lg p-3 ml-2 cursor-pointer hover:bg-muted/50 transition-colors",
                hasDetails && "cursor-pointer"
              )}
              onClick={() => hasDetails && toggleExpanded(event.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {getAgentDisplayName(event.agentType)}
                    </span>
                    {hasDetails && (
                      isExpanded 
                        ? <ChevronDown className="w-3 h-3" />
                        : <ChevronRight className="w-3 h-3" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <span>{formatTime(event.timestamp)}</span>
                    {event.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(event.duration)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress indicator */}
                {event.type === "task_progress" && event.details?.progress !== undefined && (
                  <div className="text-xs font-medium text-yellow-500">
                    {event.details.progress}%
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && hasDetails && (
                <div className="mt-2 pt-2 border-t border-muted">
                  {event.details?.progress !== undefined && (
                    <div className="mb-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${event.details.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {event.details?.error && (
                    <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
                      {event.details.error}
                    </div>
                  )}
                  {event.details?.output && (
                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto max-h-40">
                      {typeof event.details.output === "string" 
                        ? event.details.output 
                        : JSON.stringify(event.details.output, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {events.length > maxEvents && (
        <div className="text-center text-xs text-muted-foreground py-2">
          Showing {maxEvents} of {events.length} events
        </div>
      )}
    </div>
  );
}
