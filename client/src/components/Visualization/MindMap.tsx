import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MindMapNode {
  id: string;
  label: string;
  type: "file" | "folder" | "function" | "class" | "module" | "test";
  x: number;
  y: number;
  connections: string[];
  metadata?: {
    coverage?: number;
    complexity?: number;
    testCount?: number;
  };
}

interface MindMapProps {
  nodes: MindMapNode[];
  onNodeClick?: (node: MindMapNode) => void;
  className?: string;
}

const NODE_COLORS: Record<MindMapNode["type"], string> = {
  file: "#3b82f6",
  folder: "#eab308",
  function: "#22c55e",
  class: "#a855f7",
  module: "#06b6d4",
  test: "#f97316",
};

export function MindMap({ nodes, onNodeClick, className }: MindMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<MindMapNode | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offset.x + width / 2, offset.y + height / 2);
    ctx.scale(zoom, zoom);

    // Draw connections
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    for (const node of nodes) {
      for (const targetId of node.connections) {
        const target = nodes.find(n => n.id === targetId);
        if (target) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const isHovered = hoveredNode?.id === node.id;
      const radius = isHovered ? 28 : 24;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = NODE_COLORS[node.type];
      ctx.fill();
      
      if (isHovered) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Coverage indicator
      if (node.metadata?.coverage !== undefined) {
        const coverageAngle = (node.metadata.coverage / 100) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, -Math.PI / 2, -Math.PI / 2 + coverageAngle);
        ctx.strokeStyle = node.metadata.coverage > 80 ? "#22c55e" : 
                         node.metadata.coverage > 50 ? "#eab308" : "#ef4444";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const shortLabel = node.label.length > 8 
        ? node.label.slice(0, 6) + "..." 
        : node.label;
      ctx.fillText(shortLabel, node.x, node.y);
    }

    ctx.restore();
  }, [nodes, zoom, offset, hoveredNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;

    // Check for hovered node
    const hovered = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 24;
    });
    setHoveredNode(hovered || null);

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.1, Math.min(3, z * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full h-full bg-background", className)}
    >
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={() => setZoom(z => Math.min(3, z * 1.2))}
          className="p-2 bg-muted rounded hover:bg-muted-foreground/20"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.1, z * 0.8))}
          className="p-2 bg-muted rounded hover:bg-muted-foreground/20"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-muted rounded hover:bg-muted-foreground/20"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-muted/80 backdrop-blur rounded p-2 text-xs">
        <div className="flex flex-wrap gap-2">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div className="absolute top-2 left-2 bg-popover border rounded p-2 text-sm shadow-lg">
          <div className="font-medium">{hoveredNode.label}</div>
          <div className="text-muted-foreground capitalize">{hoveredNode.type}</div>
          {hoveredNode.metadata && (
            <div className="mt-1 text-xs">
              {hoveredNode.metadata.coverage !== undefined && (
                <div>Coverage: {hoveredNode.metadata.coverage}%</div>
              )}
              {hoveredNode.metadata.complexity !== undefined && (
                <div>Complexity: {hoveredNode.metadata.complexity}</div>
              )}
              {hoveredNode.metadata.testCount !== undefined && (
                <div>Tests: {hoveredNode.metadata.testCount}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
