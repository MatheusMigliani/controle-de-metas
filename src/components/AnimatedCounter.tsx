"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCounter({ value, duration = 1.5, className = "", suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = Math.round(duration * 60);
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(value);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration, started]);

  return (
    <motion.span
      className={`font-display font-bold tabular-nums ${className}`}
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, margin: "-50px" }}
    >
      {count}{suffix}
    </motion.span>
  );
}
