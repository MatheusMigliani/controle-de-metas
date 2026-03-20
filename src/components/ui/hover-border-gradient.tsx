"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

function buildMap(color: string): Record<Direction, string> {
  return {
    TOP:    `radial-gradient(20% 50% at 50% 0%,   ${color} 0%, transparent 100%)`,
    LEFT:   `radial-gradient(16% 43% at 0%   50%, ${color} 0%, transparent 100%)`,
    BOTTOM: `radial-gradient(20% 50% at 50% 100%, ${color} 0%, transparent 100%)`,
    RIGHT:  `radial-gradient(16% 43% at 100% 50%, ${color} 0%, transparent 100%)`,
  };
}

function buildHighlight(color: string): string {
  return `radial-gradient(75% 180% at 50% 50%, ${color} 0%, transparent 100%)`;
}

interface HoverBorderGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassName?: string;
  className?: string;
  innerClassName?: string;
  color?: string;
  duration?: number;
  clockwise?: boolean;
}

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  innerClassName,
  color = "rgba(255,255,255,0.7)",
  duration = 2,
  clockwise = true,
  ...props
}: React.PropsWithChildren<HoverBorderGradientProps>) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (d: Direction): Direction => {
    const dirs: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const idx = dirs.indexOf(d);
    return clockwise
      ? dirs[(idx - 1 + dirs.length) % dirs.length]
      : dirs[(idx + 1) % dirs.length];
  };

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(
      () => setDirection((d) => rotateDirection(d)),
      duration * 1000
    );
    return () => clearInterval(id);
  }, [hovered, duration, clockwise]);

  const movingMap = buildMap(color);
  const highlight = buildHighlight(color);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative p-px rounded-2xl", containerClassName)}
      {...props}
    >
      {/* Gradient border layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl z-0"
        style={{ filter: "blur(3px)" }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: 0.5 }}
      />

      {/* Inner mask */}
      <div
        className={cn(
          "absolute inset-px rounded-[calc(theme(borderRadius.2xl)-1px)] z-[1]",
          innerClassName ?? "bg-[#0b1929]"
        )}
      />

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
