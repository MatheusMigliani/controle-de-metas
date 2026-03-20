"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type ElementType,
} from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CardContextValue {
  rotateX: number;
  rotateY: number;
  hovered: boolean;
}

const CardContext = createContext<CardContextValue>({
  rotateX: 0,
  rotateY: 0,
  hovered: false,
});

// ---------------------------------------------------------------------------
// CardContainer
// ---------------------------------------------------------------------------

interface CardContainerProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function CardContainer({ children, className, containerClassName }: CardContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setRotateX(-dy * 10);
    setRotateY(dx * 10);
  }

  function handleMouseLeave() {
    setHovered(false);
    setRotateX(0);
    setRotateY(0);
  }

  return (
    <CardContext.Provider value={{ rotateX, rotateY, hovered }}>
      <div className={cn("flex items-center justify-center", containerClassName)}>
        <div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={handleMouseLeave}
          className={cn("w-full", className)}
          style={{ perspective: "800px" }}
        >
          {children}
        </div>
      </div>
    </CardContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// CardBody
// ---------------------------------------------------------------------------

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  const { rotateX, rotateY, hovered } = useContext(CardContext);

  return (
    <div
      className={cn("[transform-style:preserve-3d]", className)}
      style={{
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${hovered ? "scale3d(1.02,1.02,1.02)" : "scale3d(1,1,1)"}`,
        transition: hovered ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CardItem
// ---------------------------------------------------------------------------

interface CardItemProps {
  children: ReactNode;
  className?: string;
  translateZ?: number;
  as?: ElementType;
}

export function CardItem({
  children,
  className,
  translateZ = 0,
  as: Tag = "div",
}: CardItemProps) {
  const { hovered } = useContext(CardContext);

  const style = {
    transform: hovered ? `translateZ(${translateZ}px)` : "translateZ(0px)",
    transition: hovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
  };

  // Use div when Tag is the default to avoid generic element type issues
  if (Tag === "div") {
    return (
      <div className={cn("[transform-style:preserve-3d]", className)} style={style}>
        {children}
      </div>
    );
  }

  const AnyTag = Tag as "span";
  return (
    <AnyTag className={cn("[transform-style:preserve-3d]", className)} style={style}>
      {children}
    </AnyTag>
  );
}
