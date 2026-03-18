"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMotionTemplate, useMotionValue, useSpring, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MouseEnterContextType = [boolean, React.Dispatch<React.SetStateAction<boolean>>];
const MouseEnterContext = createContext<MouseEnterContextType | undefined>(undefined);

export function CardContainer({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const borderGradient = useMotionTemplate`radial-gradient(circle at ${springX}% ${springY}%, rgba(66,185,235,0.75) 0%, rgba(255,255,255,0.25) 25%, transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 30;
    const y = (e.clientY - top - height / 2) / 30;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;

    mouseX.set(((e.clientX - left) / width) * 100);
    mouseY.set(((e.clientY - top) / height) * 100);
  };

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    if (containerRef.current) {
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }
    mouseX.set(50);
    mouseY.set(50);
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn("flex items-center justify-center", containerClassName)}
        style={{ perspective: "1200px" }}
      >
        <div
          ref={containerRef}
          onMouseEnter={() => setIsMouseEntered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn("relative transition-all duration-200 ease-linear", className)}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Shiny border overlay — mask exclui centro, mostra apenas 1px de borda */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute rounded-2xl transition-opacity duration-500"
            style={{
              inset: 0,
              padding: "1px",
              background: borderGradient,
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              opacity: isMouseEntered ? 1 : 0,
              zIndex: 10,
            }}
          />
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
}

export function CardBody({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardItem({
  as: Tag = "div",
  children,
  className,
  translateZ = 0,
  translateX = 0,
  translateY = 0,
  ...rest
}: {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  translateZ?: number;
  translateX?: number;
  translateY?: number;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px)`;
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px)`;
    }
  }, [isMouseEntered, translateX, translateY, translateZ]);

  const TagEl = Tag as any; // React.ElementType não aceita ref diretamente

  return (
    <TagEl
      ref={ref}
      className={cn("transition-all duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </TagEl>
  );
}

function useMouseEnter() {
  const context = useContext(MouseEnterContext);
  if (!context) throw new Error("useMouseEnter must be used within CardContainer");
  return context;
}
