"use client";

import { motion } from "framer-motion";
import { Layers, CheckCircle2, Clock, FileText } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOverviewStats, getTemas } from "@/lib/metas-api";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3DCard";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface StatsData {
  total: number;
  emAndamento: number;
  concluidas: number;
  totalDocumentos: number;
  pct: number;
}

interface StatusItem {
  label: string;
  key: keyof Omit<StatsData, "pct">;
  icon: LucideIcon;
  iconClass: string;
}

const CARD_BASE =
  "bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-2xl";

const STATUS_ITEMS: StatusItem[] = [
  { label: "Concluídas",        key: "concluidas",       icon: CheckCircle2, iconClass: "text-emerald-400" },
  { label: "Em Andamento",      key: "emAndamento",      icon: Clock,        iconClass: "text-yellow-400"  },
  { label: "Total Documentos",  key: "totalDocumentos",  icon: FileText,     iconClass: "text-[#42b9eb]"   },
];

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PanoramaSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      <div className={`${CARD_BASE} p-8 md:row-span-3 min-h-[360px] flex flex-col justify-between`}>
        <div>
          <div className="h-8 w-8 bg-white/[0.06] rounded-lg mb-8" />
          <div className="h-20 w-44 bg-white/10 rounded mb-3" />
          <div className="h-3 w-52 bg-white/[0.06] rounded" />
        </div>
        <div className="border-t border-white/[0.06] pt-8">
          <div className="flex justify-between mb-3">
            <div className="h-3 w-24 bg-white/[0.06] rounded" />
            <div className="h-3 w-12 bg-white/[0.06] rounded" />
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full" />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`${CARD_BASE} p-6 flex items-center gap-6 min-h-[100px]`}>
          <div className="w-12 h-12 bg-white/[0.06] rounded-xl shrink-0" />
          <div className="space-y-2">
            <div className="h-2.5 w-20 bg-white/[0.06] rounded" />
            <div className="h-9 w-14 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bento Grid
// ---------------------------------------------------------------------------

function BentoGrid({ stats, numTemas }: { stats: StatsData; numTemas: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ── Card grande ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`${CARD_BASE} p-8 md:row-span-3 flex flex-col justify-between relative overflow-hidden`}
      >
        {/* Glow decorativo */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#42b9eb]/[0.07] blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#42b9eb]/10 border border-[#42b9eb]/20">
              <Layers className="w-4 h-4 text-[#42b9eb]" />
            </span>
            <span className="text-white/40 text-xs uppercase tracking-widest">
              Total de Metas
            </span>
          </div>

          <div className="flex items-end gap-3 mb-2">
            <NumberTicker
              value={stats.total}
              className="text-7xl md:text-8xl text-white font-display font-bold leading-none"
            />
            <span className="text-white/25 text-xl font-display mb-2">metas</span>
          </div>

          {numTemas > 0 && (
            <p className="text-white/30 text-sm mt-3">
              distribuídas em{" "}
              <span className="text-white/60 font-semibold">{numTemas}</span>{" "}
              {numTemas === 1 ? "tema estratégico" : "temas estratégicos"}
            </p>
          )}
        </div>

        {/* Progresso */}
        <div className="relative mt-auto pt-8 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/35 text-xs uppercase tracking-widest">
              Progresso global
            </span>
            <div className="flex items-baseline gap-0.5">
              <NumberTicker
                value={stats.pct}
                className="text-2xl text-[#42b9eb] font-display font-bold tabular-nums"
                delay={0.4}
              />
              <span className="text-[#42b9eb]/70 text-sm font-display">%</span>
            </div>
          </div>
          <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#42b9eb] to-[#7dd3f8] rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${stats.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <p className="text-white/25 text-[11px] mt-2">metas concluídas</p>
        </div>
      </motion.div>

      {/* ── 3 cards pequenos ────────────────────────────── */}
      {STATUS_ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
          >
            <CardContainer className="w-full">
              <CardBody className={`${CARD_BASE} w-full p-6 flex items-center gap-6`}>
                {/* Ícone */}
                <CardItem translateZ={40} className="shrink-0">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                    <Icon className={`w-5 h-5 ${item.iconClass}`} />
                  </span>
                </CardItem>

                {/* Texto */}
                <CardItem translateZ={25} className="min-w-0">
                  <span className="block text-white/35 text-[11px] uppercase tracking-widest mb-1 truncate">
                    {item.label}
                  </span>
                  <NumberTicker
                    value={stats[item.key]}
                    className="text-4xl text-white font-display font-bold leading-none tabular-nums"
                    delay={0.25 + i * 0.05}
                  />
                </CardItem>
              </CardBody>
            </CardContainer>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function PanoramaSection() {
  const { data: overview, isLoading, isError } = useQuery({
    queryKey: ["stats-overview"],
    queryFn: getOverviewStats,
  });

  const { data: temas } = useQuery({
    queryKey: ["temas"],
    queryFn: getTemas,
  });

  const numTemas = temas?.length ?? 0;

  // Conta metas com documentUrl a partir do cache de temas
  const totalDocumentos = temas
    ? temas.reduce(
        (acc, t) =>
          acc +
          t.topicos.reduce(
            (a, tp) => a + tp.metas.filter((m) => m.documentUrl).length,
            0
          ),
        0
      )
    : 0;

  const stats: StatsData | null = overview
    ? {
        total: overview.totalMetas,
        emAndamento: overview.emAndamento,
        concluidas: overview.concluidas,
        totalDocumentos,
        pct: Math.round(overview.percentualConcluidas * 10) / 10,
      }
    : null;

  return (
    <section id="panorama" className="py-32 relative">
      <div className="absolute inset-0 gradient-mesh-bg" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs font-medium text-[#42b9eb] uppercase tracking-[0.2em] mb-3 block">
            Panorama Geral
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            <TypewriterEffect
              words={[
                { text: "Visão" },
                { text: "em" },
                { text: "Números", className: "text-[#42b9eb]" },
              ]}
            />
          </h2>
          <p className="text-white/40 max-w-lg text-lg">
            {stats
              ? `${stats.total} metas monitoradas em tempo real.`
              : "Carregando estatísticas..."}
          </p>
        </motion.div>

        {isLoading && <PanoramaSkeleton />}

        {isError && (
          <div className="flex items-center justify-center py-20">
            <div className={`${CARD_BASE} px-8 py-10 text-center max-w-sm`}>
              <p className="text-white/40 text-sm">
                Não foi possível carregar as estatísticas.
              </p>
            </div>
          </div>
        )}

        {stats && <BentoGrid stats={stats} numTemas={numTemas} />}
      </div>
      <ScrollIndicator href="#marcos" />
    </section>
  );
}
