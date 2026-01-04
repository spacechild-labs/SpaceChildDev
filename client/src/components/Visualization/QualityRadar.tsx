import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface QualityDimension {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

interface QualityRadarProps {
  dimensions: QualityDimension[];
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
}

export function QualityRadar({
  dimensions,
  className,
  showLabels = true,
  showValues = true,
  animated = true,
}: QualityRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const size = Math.min(canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = size * 0.35;
    const numDimensions = dimensions.length;
    const angleStep = (Math.PI * 2) / numDimensions;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background circles
    const levels = 5;
    for (let i = levels; i >= 1; i--) {
      const levelRadius = (radius / levels) * i;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + (i / levels) * 0.1})`;
      ctx.lineWidth = 1;
      
      for (let j = 0; j <= numDimensions; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axis lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < numDimensions; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i <= numDimensions; i++) {
      const dim = dimensions[i % numDimensions];
      const value = dim.value / (dim.maxValue || 100);
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    // Fill with gradient
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, "rgba(0, 212, 255, 0.3)");
    gradient.addColorStop(1, "rgba(0, 212, 255, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke outline
    ctx.strokeStyle = "rgba(0, 212, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < numDimensions; i++) {
      const dim = dimensions[i];
      const value = dim.value / (dim.maxValue || 100);
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = dim.color || "#00d4ff";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw labels
    if (showLabels) {
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < numDimensions; i++) {
        const dim = dimensions[i];
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = radius + 25;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;

        ctx.fillText(dim.label, x, y);
        
        if (showValues) {
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "#71717a";
          ctx.fillText(`${dim.value.toFixed(0)}%`, x, y + 12);
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "#a1a1aa";
        }
      }
    }
  }, [dimensions, showLabels, showValues]);

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full h-full"
      />
    </div>
  );
}
