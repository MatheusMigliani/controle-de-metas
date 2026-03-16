"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Sun,
  Moon,
  LayoutList,
  CheckCircle2,
  Clock3,
  FileCheck2,
  BarChart3,
  Calendar,
} from "lucide-react";
import { planos, etapas } from "@/lib/mock-data";

const navItems = [
  { id: "hero", label: "Início" },
  { id: "panorama", label: "Panorama" },
  { id: "planos", label: "Planos" },
  { id: "analise", label: "Análise" },
  { id: "calendario", label: "Calendário" },
];

function DropdownPanorama() {
  const total = etapas.length;
  const concluidas = etapas.filter((e) => e.status === "Concluída").length;
  const emAndamento = etapas.filter((e) => e.status === "Em Andamento").length;
  const docsGerados = etapas.filter(
    (e) => e.documento_comprobatorio === "Documento Gerado"
  ).length;

  const stats = [
    { icon: LayoutList, label: "Total etapas", value: total },
    { icon: CheckCircle2, label: "Concluídas", value: concluidas },
    { icon: Clock3, label: "Em Andamento", value: emAndamento },
    { icon: FileCheck2, label: "Docs Gerados", value: docsGerados },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col items-start gap-1 p-2 rounded-xl bg-slate-50 dark:bg-white/5"
        >
          <Icon size={14} className="text-primary" />
          <span className="text-base font-bold text-foreground leading-none">
            {value}
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function DropdownPlanos() {
  return (
    <div className="flex flex-col gap-1">
      {planos.slice(0, 5).map((plano) => (
        <a
          key={plano.id}
          href="#planos"
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
        >
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold font-mono shrink-0">
            {plano.code}
          </span>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[150px]">
            {plano.title}
          </span>
        </a>
      ))}
      <div className="mt-1 pt-2 border-t border-slate-200/80 dark:border-white/10">
        <a
          href="#planos"
          className="text-[11px] text-primary font-medium hover:underline"
        >
          Ver todos os planos →
        </a>
      </div>
    </div>
  );
}

function DropdownAnalise() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 shrink-0">
          <BarChart3 size={16} className="text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Evolução Mensal
          </span>
          <span className="text-[11px] text-muted-foreground leading-relaxed">
            Distribuição de etapas por mês e status ao longo de 2025.
          </span>
        </div>
      </div>
      <a
        href="#analise"
        className="text-[11px] text-primary font-medium hover:underline"
      >
        Ver análise →
      </a>
    </div>
  );
}

function DropdownCalendario() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 shrink-0">
          <Calendar size={16} className="text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Calendário de Prazos
          </span>
          <span className="text-[11px] text-muted-foreground leading-relaxed">
            Visualize prazos e etapas por data de vencimento.
          </span>
        </div>
      </div>
      <a
        href="#calendario"
        className="text-[11px] text-primary font-medium hover:underline"
      >
        Ver calendário →
      </a>
    </div>
  );
}

const dropdownContent: Record<string, React.ReactNode> = {
  panorama: <DropdownPanorama />,
  planos: <DropdownPlanos />,
  analise: <DropdownAnalise />,
  calendario: <DropdownCalendario />,
};

export function Navbar() {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.88] dark:bg-slate-900/[0.82] backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,180,180,0.07)] dark:shadow-[0_0_0_1px_rgba(0,180,180,0.12),0_4px_16px_rgba(0,0,0,0.5),0_20px_60px_rgba(0,180,180,0.10)]"
            : "shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,180,180,0.05)] dark:shadow-[0_0_0_1px_rgba(0,180,180,0.08),0_2px_8px_rgba(0,0,0,0.35),0_12px_36px_rgba(0,180,180,0.08)]"
        }`}
      >
        {/* Logos de branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center">
            <Image
              src="/brand/logoazul.png"
              alt="Prefeitura Rio Saúde"
              width={100}
              height={32}
              className="block dark:hidden object-contain"
              priority
            />
            <Image
              src="/brand/logobranca.png"
              alt="Prefeitura Rio Saúde"
              width={100}
              height={32}
              className="hidden dark:block object-contain"
              priority
            />
          </div>

          <div className="w-px h-6 bg-border/40" />

          <Image
            src="/brand/tcmrio-logo.png"
            alt="TCMRio"
            width={72}
            height={28}
            className="object-contain"
            priority
          />
        </div>

        <div className="w-px h-4 bg-border/40 mx-1" />

        {/* Nav items com separadores */}
        <div className="hidden md:flex items-center">
          {navItems.map((item, index) => {
            const isActive = active === item.id;
            const hasDropdown = item.id !== "hero";
            const isLast = index === navItems.length - 1;

            return (
              <div key={item.id} className="flex items-center">
                <div
                  className="relative"
                  onMouseEnter={() => hasDropdown && setOpenDropdown(item.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setTimeout(() => window.dispatchEvent(new Event("backtotop")), 150)}
                    className={`relative flex items-center text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="pill"
                        className="absolute inset-0 rounded-full bg-primary/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </a>

                  <AnimatePresence>
                    {hasDropdown && openDropdown === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl p-4 min-w-[220px]"
                      >
                        {dropdownContent[item.id]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isLast && (
                  <div className="w-px h-3.5 bg-border/30 mx-0.5 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <div className="w-px h-4 bg-border/40 mx-1" />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-border/50 bg-background/80 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200"
          aria-label="Alternar tema"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.nav>
    </div>
  );
}
