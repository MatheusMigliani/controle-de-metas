"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface DecryptedTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export function DecryptedText({ text, className, delay = 0, speed = 45 }: DecryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(() =>
    text
      .split("")
      .map((c) => (c === " " ? " " : randomChar()))
      .join("")
  );

  useEffect(() => {
    if (!isInView) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    timeoutId = setTimeout(() => {
      let revealed = 0;

      intervalId = setInterval(() => {
        setDisplay(() => {
          const arr = text.split("");

          if (revealed < text.length) {
            if (text[revealed] !== " ") revealed++;
            else revealed++;
          }

          for (let i = revealed; i < text.length; i++) {
            if (text[i] !== " ") arr[i] = randomChar();
          }

          if (revealed >= text.length) {
            clearInterval(intervalId);
            return text;
          }

          return arr.join("");
        });
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isInView, text, delay, speed]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {display}
    </span>
  );
}
