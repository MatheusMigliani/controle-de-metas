"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className }: MeteorsProps) {
  const meteors = useMemo(
    () =>
      Array.from({ length: number }, (_, i) => ({
        id: i,
        left: `${Math.floor(Math.random() * 100)}%`,
        delay: `${(Math.random() * 0.8).toFixed(2)}s`,
        duration: `${Math.floor(Math.random() * 8) + 4}s`,
      })),
    [number]
  );

  return (
    <>
      {meteors.map((m) => (
        <span
          key={m.id}
          className={cn(
            "pointer-events-none absolute top-0 h-px w-[80px] rotate-[215deg]",
            "animate-meteor-effect",
            "bg-gradient-to-r from-white/50 to-transparent",
            "before:absolute before:top-1/2 before:left-0",
            "before:-translate-y-1/2 before:h-[2px] before:w-[2px]",
            "before:rounded-full before:bg-white/60",
            className
          )}
          style={{
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </>
  );
}
