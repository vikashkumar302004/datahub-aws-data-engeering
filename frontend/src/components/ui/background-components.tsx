import { cn } from "@/lib/utils";
import React from "react";

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const DashedBackground = ({ children, className }: BackgroundProps) => {
  return (
    <div className={cn("min-h-screen w-full relative bg-[#09090b]", className)}>
      <style>{`
        @keyframes pan-grid {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 40px 40px, 40px 40px; }
        }
      `}</style>
      {/* Dashed Gradient - Adjusted for Dark Mode */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          animation: 'pan-grid 15s linear infinite',
          backgroundImage: `
            linear-gradient(to right, #27272a 1px, transparent 1px),
            linear-gradient(to bottom, #27272a 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
          opacity: 0.5,
        }}
      />
      {/* Radial fade to blend edges if needed */}
      <div className="absolute inset-0 bg-[#09090b] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
