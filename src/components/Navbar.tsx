"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "hero", label: "Início" },
  { id: "panorama", label: "Panorama" },
  { id: "planos", label: "Planos" },
  { id: "analise", label: "Análise" },
  { id: "calendario", label: "Calendário" },
];

export function Navbar() {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      for (const item of [...navItems].reverse()) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(item.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/30" : ""
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-sm text-foreground">
            Prefeitura Rio <span className="text-primary">|</span> Saúde
          </span>
          <span className="text-border">•</span>
          <span className="font-display font-bold text-xs text-primary tracking-wider">TCMRio</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link relative ${active === item.id ? "nav-link-active" : ""}`}
            >
              {item.label}
              <AnimatePresence>
                {active === item.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </a>
          ))}
        </div>

        <a
          href="#planos"
          className="hidden sm:inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-display font-semibold hover:bg-primary/20 transition-colors"
        >
          Ver Detalhes
        </a>
      </div>
    </motion.nav>
  );
}
