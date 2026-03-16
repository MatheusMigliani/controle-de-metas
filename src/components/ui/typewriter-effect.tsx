"use client";

import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Word {
  text: string;
  className?: string;
}

interface TypewriterEffectProps {
  words: Word[];
  className?: string;
  cursorClassName?: string;
}

export function TypewriterEffect({
  words,
  className,
  cursorClassName,
}: TypewriterEffectProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  // Flatten words into individual characters for animation
  const wordsWithChars = words.map((word) => ({
    ...word,
    chars: word.text.split(""),
  }));

  // Total characters before each word (for staggered delay)
  const charOffsets: number[] = [];
  let offset = 0;
  for (const word of wordsWithChars) {
    charOffsets.push(offset);
    offset += word.chars.length;
  }
  const totalChars = offset;

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap items-baseline gap-x-[0.35em]", className)}>
      {wordsWithChars.map((word, wi) => (
        <span key={wi} className="inline-flex">
          {word.chars.map((char, ci) => {
            const globalIndex = charOffsets[wi] + ci;
            return (
              <motion.span
                key={ci}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{
                  duration: 0.08,
                  delay: globalIndex * 0.05,
                  ease: "linear",
                }}
                className={word.className}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
      {/* Blinking cursor */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatDelay: 0,
          delay: totalChars * 0.05,
        }}
        className={cn(
          "inline-block rounded-sm w-[3px] h-[1em] bg-current align-middle ml-0.5",
          cursorClassName
        )}
      />
    </span>
  );
}
