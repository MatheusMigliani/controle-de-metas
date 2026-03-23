"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import * as Accordion from "@radix-ui/react-accordion";
import { getTemas } from "@/lib/metas-api";
import {
  type ApiTema,
  type ApiTopico,
  type MetaStatus,
  type EtapaStatus,
  type PlanoDeAcao,
  type Etapa,
  META_STATUS_CONFIG,
} from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { AnimatedCounter } from "./AnimatedCounter";
import SpotlightCard from "@/components/SpotlightCard";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Users,
  Target,
  Flag,
  LayoutGrid,
  X,
} from "lucide-react";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";

// ── Constantes ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "temas", label: "Temas Estratégicos", icon: Target },
  { id: "planos", label: "Planos de Ação", icon: Flag },
] as const;

type TabId = (typeof TABS)[number]["id"];

const AUTOPLAY_INTERVAL = 8000;

// ── Utilitários ───────────────────────────────────────────────────────────────

function mapStatus(apiStatus: string): EtapaStatus {
  const map: Record<string, EtapaStatus> = {
    NaoIniciada: "Não Iniciada",
    EmAndamento: "Em Andamento",
    Concluida: "Concluída",
    DocumentoGerado: "Documento Gerado",
    AguardandoRetorno: "Aguardando retorno da área",
  };
  return map[apiStatus] ?? "Não Iniciada";
}

function temaToPlano(tema: ApiTema, index: number): PlanoDeAcao {
  return {
    id: tema.id,
    code: "PA" + String(index + 1).padStart(2, "0"),
    title: tema.nome.replace(/ \(.*\)$/, ""),
    description: tema.topicos[0]?.descricao ?? "—",
    area:
      [...new Set(tema.topicos.map((t) => t.setorResponsavel).filter(Boolean))].join(", ") || "—",
    created_at: tema.createdAt,
  };
}

function temaToEtapas(tema: ApiTema, code: string): Etapa[] {
  const etapas: Etapa[] = [];
  let stepIndex = 0;
  for (const topico of tema.topicos) {
    for (const meta of topico.metas) {
      etapas.push({
        id: meta.id,
        plan_id: tema.id,
        step_number: stepIndex + 1,
        description: meta.descricao,
        tema: topico.descricao.slice(0, 60) + (topico.descricao.length > 60 ? "..." : ""),
        relacao_direta: code,
        area: topico.setorResponsavel || "—",
        prazo: "—",
        status: mapStatus(meta.status),
        documento_comprobatorio: meta.documentUrl ? "Documento" : "",
        drive_link: meta.documentUrl ?? "",
        created_at: meta.createdAt,
      });
      stepIndex++;
    }
  }
  return etapas;
}

function extractTipo(nome: string): string | null {
  const match = nome.match(/\(([^)]+)\)$/);
  return match ? match[1] : null;
}

// ── Swipe variants ────────────────────────────────────────────────────────────

const swipeVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 16 : -16, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -16 : 16, opacity: 0 }),
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white/[0.05] border border-white/[0.07] rounded-2xl p-5 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/4 bg-white/10 rounded" />
              <div className="h-2.5 w-1/3 bg-white/[0.06] rounded" />
            </div>
            <div className="h-5 w-20 bg-white/[0.06] rounded-full ml-4" />
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full mb-3" />
          <div className="h-2.5 w-1/2 bg-white/[0.06] rounded" />
        </div>
      ))}
    </div>
  );
}

// ── MetaStatusBadge ───────────────────────────────────────────────────────────

function MetaStatusBadge({ status }: { status: MetaStatus }) {
  const cfg = META_STATUS_CONFIG[status] ?? META_STATUS_CONFIG.NaoIniciada;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color} shrink-0`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── TopicoAccordionItem ───────────────────────────────────────────────────────

function TopicoAccordionItem({
  topico,
  index,
  temaId,
}: {
  topico: ApiTopico;
  index: number;
  temaId: string;
}) {
  const totalMetas = topico.metas.length;
  const concluidas = topico.metas.filter(
    (m) => m.status === "Concluida" || m.status === "DocumentoGerado"
  ).length;
  const pct = totalMetas > 0 ? Math.round((concluidas / totalMetas) * 100) : 0;
  // value único por tema + tópico para evitar colisão entre sheets re-renderizados
  const itemValue = `${temaId}-${topico.id}`;

  return (
    <Accordion.Item
      value={itemValue}
      className="border border-white/[0.07] rounded-xl overflow-hidden group/item"
    >
      <Accordion.Trigger className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-white/[0.04] data-[state=open]:bg-white/[0.04] transition-colors">
        {/* Número */}
        <span className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono font-semibold text-white/40 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Descrição + mini progress */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/70 line-clamp-2 leading-snug mb-2">
            {topico.descricao}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#42b9eb]/60 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-white/30 tabular-nums whitespace-nowrap shrink-0">
              {concluidas}/{totalMetas}
            </span>
          </div>
        </div>

        {/* Setor + chevron */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {topico.setorResponsavel && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#42b9eb]/10 border border-[#42b9eb]/20 text-[#42b9eb] text-center">
              {topico.setorResponsavel}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-white/25 transition-transform duration-200 group-data-[state=open]/item:rotate-180 shrink-0" />
        </div>
      </Accordion.Trigger>

      <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="px-4 pb-4 pt-1 space-y-3">
          {/* Pontos focais */}
          {topico.pontosFocais.length > 0 && (
            <div className="flex items-start gap-2 pt-1">
              <Users className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {topico.pontosFocais.map((pf) => (
                  <span
                    key={pf}
                    className="text-[10px] text-white/45 bg-white/[0.05] border border-white/[0.07] rounded px-1.5 py-0.5"
                  >
                    {pf}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metas */}
          {topico.metas.length > 0 ? (
            <ul className="space-y-1.5">
              {topico.metas.map((meta) => {
                const cfg = META_STATUS_CONFIG[meta.status] ?? META_STATUS_CONFIG.NaoIniciada;
                return (
                  <li
                    key={meta.id}
                    className="flex items-start gap-2.5 rounded-lg p-2.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.08] transition-colors"
                  >
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <p className="flex-1 text-xs text-white/55 leading-relaxed">{meta.descricao}</p>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <MetaStatusBadge status={meta.status} />
                      {meta.documentUrl && (
                        <a
                          href={meta.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#42b9eb]/50 hover:text-[#42b9eb] transition-colors"
                          title="Ver documento"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-white/25 italic">Nenhuma meta cadastrada.</p>
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

// ── TemaSheet ─────────────────────────────────────────────────────────────────

function TemaSheet({
  tema,
  open,
  onClose,
}: {
  tema: ApiTema | null;
  open: boolean;
  onClose: () => void;
}) {
  const todasMetas = tema?.topicos.flatMap((t) => t.metas) ?? [];
  const total = todasMetas.length;
  const concluidas = todasMetas.filter(
    (m) => m.status === "Concluida" || m.status === "DocumentoGerado"
  ).length;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const tipo = tema ? extractTipo(tema.nome) : null;
  const nomeClean = tema?.nome.replace(/ \([^)]+\)$/, "") ?? "";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="!bg-[#0b1929] !border-l !border-white/[0.08] !p-0 !w-full sm:!max-w-xl flex flex-col gap-0"
      >
        {/* Cabeçalho */}
        <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <SheetTitle className="!text-white !font-display !font-bold !text-xl leading-snug pr-8">
              {nomeClean}
            </SheetTitle>
            {tipo && (
              <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#42b9eb]/10 border border-[#42b9eb]/20 text-[#42b9eb]">
                {tipo}
              </span>
            )}
          </div>

          {/* Progresso geral */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/35">Progresso geral</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[#42b9eb] font-semibold tabular-nums">{pct}%</span>
                <span className="text-white/25">·</span>
                <span className="text-white/35 tabular-nums">
                  {concluidas}/{total} metas
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#42b9eb]/60 to-[#42b9eb] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: open ? `${pct}%` : 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              />
            </div>
          </div>

          {/* Chips de contagem */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: `${tema?.topicos.length ?? 0} tópicos` },
              { label: `${total} metas` },
            ].map(({ label }) => (
              <span
                key={label}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/[0.05] border border-white/[0.08] text-white/45"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Accordion de tópicos — scroll independente */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {tema && tema.topicos.length > 0 ? (
            <Accordion.Root type="single" collapsible className="space-y-2">
              {[...tema.topicos].sort((a, b) => {
                  const n = (s: string) => { const m = s.match(/Etapa\s+(\d+)/i); return m ? parseInt(m[1], 10) : 9999; };
                  return n(a.descricao) - n(b.descricao);
                }).map((topico, i) => (
                <TopicoAccordionItem
                  key={topico.id}
                  topico={topico}
                  index={i}
                  temaId={tema.id}
                />
              ))}
            </Accordion.Root>
          ) : (
            <p className="text-xs text-white/25 italic text-center py-8">
              Nenhum tópico cadastrado.
            </p>
          )}
        </div>

        {/* Botão fechar customizado no rodapé */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/45 text-xs font-medium hover:bg-white/[0.08] hover:text-white/65 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Fechar
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── TemaCard — compacto, sem accordion ───────────────────────────────────────

function TemaCard({
  tema,
  index,
  selected,
  onClick,
}: {
  tema: ApiTema;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const tipo = extractTipo(tema.nome);
  const nomeClean = tema.nome.replace(/ \([^)]+\)$/, "");
  const todasMetas = tema.topicos.flatMap((t) => t.metas);
  const total = todasMetas.length;
  const concluidas = todasMetas.filter(
    (m) => m.status === "Concluida" || m.status === "DocumentoGerado"
  ).length;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`w-full text-left group transition-all duration-300 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#42b9eb]/50 ${
        selected
          ? "ring-1 ring-[#42b9eb]/40 shadow-[0_0_28px_hsl(196_100%_40%/0.12)]"
          : ""
      }`}
    >
      <SpotlightCard
        spotlightColor="rgba(66, 185, 235, 0.1)"
        className={`bg-white/[0.05] border rounded-2xl p-5 h-full flex flex-col transition-colors duration-300 ${
          selected
            ? "border-[#42b9eb]/35"
            : "border-white/[0.08] hover:border-white/[0.15]"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-sm font-display font-semibold text-white leading-snug line-clamp-2 flex-1">
            {nomeClean}
          </p>
          {tipo && (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#42b9eb]/10 border border-[#42b9eb]/20 text-[#42b9eb]">
              {tipo}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="text-white/30">Progresso</span>
            <span className={`font-semibold tabular-nums ${selected ? "text-[#42b9eb]" : "text-white/40"}`}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-300 ${
                selected
                  ? "bg-gradient-to-r from-[#42b9eb]/70 to-[#42b9eb]"
                  : "bg-white/20"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, delay: index * 0.05 + 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] text-white/30 tabular-nums">
            {tema.topicos.length} {tema.topicos.length === 1 ? "tópico" : "tópicos"} &middot;{" "}
            {total} {total === 1 ? "meta" : "metas"}
          </span>
          <span
            className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
              selected ? "text-[#42b9eb]" : "text-white/25 group-hover:text-white/45"
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            Ver detalhes
          </span>
        </div>
      </SpotlightCard>
    </motion.button>
  );
}

// ── TemasTab ──────────────────────────────────────────────────────────────────

function TemasTab({ temas, onInteract }: { temas: ApiTema[]; onInteract: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTema = temas.find((t) => t.id === selectedId) ?? null;

  const totalTopicos = temas.reduce((acc, t) => acc + t.topicos.length, 0);
  const totalMetas = temas.reduce(
    (acc, t) => acc + t.topicos.reduce((a, tp) => a + tp.metas.length, 0),
    0
  );

  return (
    <>
      {/* Chips de totais */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          `${temas.length} ${temas.length === 1 ? "tema" : "temas"}`,
          `${totalTopicos} ${totalTopicos === 1 ? "tópico" : "tópicos"}`,
          `${totalMetas} ${totalMetas === 1 ? "meta" : "metas"}`,
        ].map((label, i) => (
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-white/50"
          >
            {label}
          </motion.span>
        ))}
      </div>

      {/* Grid de cards compactos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {temas.map((tema, i) => (
          <TemaCard
            key={tema.id}
            tema={tema}
            index={i}
            selected={selectedId === tema.id}
            onClick={() => { onInteract(); setSelectedId(selectedId === tema.id ? null : tema.id); }}
          />
        ))}
      </div>

      {/* Sheet lateral — isolado do grid */}
      <TemaSheet
        tema={selectedTema}
        open={selectedTema !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

// ── PlanosTab ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function PlanosTab({ temas, onInteract }: { temas: ApiTema[]; onInteract: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [mounted, setMounted]   = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const planos: PlanoDeAcao[] = temas.map((t, i) => temaToPlano(t, i));

  const etapasByPlan: Record<string, Etapa[]> = {};
  planos.forEach((plano, i) => {
    etapasByPlan[plano.id] = temaToEtapas(temas[i], plano.code);
  });

  const selectedPlan  = planos.find((p) => p.id === selected);
  const planEtapas    = (selected ? (etapasByPlan[selected] ?? []) : [])
    .slice()
    .sort((a, b) => {
      const num = (s: string) => { const m = s.match(/Etapa\s+(\d+)/i); return m ? parseInt(m[1], 10) : 9999; };
      return num(a.tema) - num(b.tema);
    });
  const totalPages    = Math.ceil(planEtapas.length / PAGE_SIZE);
  const pagedEtapas   = planEtapas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const completed     = planEtapas.filter(
    (e) => e.status === "Concluída" || e.status === "Documento Gerado"
  ).length;
  const pct = planEtapas.length > 0 ? Math.round((completed / planEtapas.length) * 100) : 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {planos.map((plan, i) => {
          const pe = etapasByPlan[plan.id] ?? [];
          const pc = pe.filter(
            (e) => e.status === "Concluída" || e.status === "Documento Gerado"
          ).length;
          const pp = pe.length > 0 ? Math.round((pc / pe.length) * 100) : 0;
          const isSelected = selected === plan.id;

          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => { onInteract(); setSelected(isSelected ? null : plan.id); setPage(1); }}
              className={`glass-panel p-6 text-left transition-all duration-300 group ${
                isSelected
                  ? "border-primary/50 shadow-[0_0_30px_hsl(189_100%_44%/0.1)]"
                  : "hover:border-border/60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground flex-1 pr-2">{plan.title}</h3>
                <ChevronRight
                  className={`shrink-0 w-4 h-4 text-muted-foreground transition-transform duration-300 mt-0.5 ${
                    isSelected ? "rotate-90 text-primary" : "group-hover:translate-x-1"
                  }`}
                /></div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{plan.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {mounted ? `${pe.length} etapas` : "-- etapas"}
                </span>
                <span className="text-primary font-semibold">
                  {mounted ? `${pp}%` : "--%"}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{ width: mounted ? `${pp}%` : 0 }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedPlan && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-8 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-2xl text-foreground mb-1">
                    {selectedPlan.title}
                  </h3>
                  <p className="text-muted-foreground">{selectedPlan.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <AnimatedCounter value={completed} className="text-3xl text-primary" />
                    <span className="text-muted-foreground text-lg">/</span>
                    <AnimatedCounter value={planEtapas.length} className="text-3xl text-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    etapas &bull; {pct}% concluído
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Etapa", "Descritivo", "Tema", "Área", "Prazo", "Status", "Doc.", "Link"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedEtapas.map((etapa, i) => (
                      <motion.tr
                        key={etapa.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`border-b border-border/20 hover:bg-accent/20 transition-colors ${
                          i % 2 === 0 ? "bg-card/20" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5 font-display font-semibold text-primary">
                          {(() => { const m = etapa.tema.match(/Etapa\s+(\d+)/i); return m ? `E${parseInt(m[1], 10)}` : `E${etapa.step_number}`; })()}
                        </td>
                        <td className="px-4 py-2.5 text-foreground max-w-[400px]">
                          {etapa.description}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{etapa.tema}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{etapa.area}</td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                          {etapa.prazo}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={etapa.status} />
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {etapa.documento_comprobatorio || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          {etapa.drive_link ? (
                            <a
                              href={etapa.drive_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-border/30">
                  <span className="text-xs text-muted-foreground">
                    Etapas{" "}
                    <span className="font-medium text-foreground">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, planEtapas.length)}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium text-foreground">{planEtapas.length}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          p === page
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "border border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PlanosSection ─────────────────────────────────────────────────────────────

export function PlanosSection() {
  const [activeTab, setActiveTab] = useState<TabId>("temas");
  const [direction, setDirection] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  // hovered: pausa temporária ao passar o mouse
  // stopped: parada definitiva ao clicar em qualquer elemento interativo
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);

  const isPlaying = !hovered && !stopped;

  const { data: temas, isLoading, isError } = useQuery({
    queryKey: ["temas"],
    queryFn: getTemas,
  });

  // Para o autoplay definitivamente (clique em tab, card ou sheet)
  const stopAutoplay = useCallback(() => setStopped(true), []);

  const switchTab = useCallback(
    (id: TabId, manual = false) => {
      const currentIdx = TABS.findIndex((t) => t.id === activeTab);
      const nextIdx = TABS.findIndex((t) => t.id === id);
      setDirection(nextIdx > currentIdx ? 1 : -1);
      setActiveTab(id);
      setProgressKey((k) => k + 1);
      if (manual) stopAutoplay();
    },
    [activeTab, stopAutoplay]
  );

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setActiveTab((prev) => {
        const idx = TABS.findIndex((t) => t.id === prev);
        const next = TABS[(idx + 1) % TABS.length];
        setDirection(1);
        setProgressKey((k) => k + 1);
        return next.id;
      });
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [isPlaying]);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  return (
    <section id="planos" className="py-32 relative">
      <span id="temas" className="absolute -top-20" aria-hidden />

      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs font-medium text-[#42b9eb] uppercase tracking-[0.2em] mb-3 block">
            Acompanhamento
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Estratégia & Planos
          </h2>
          <p className="text-white/40 max-w-lg text-lg">
            Visualize os temas estratégicos e os planos de ação com status em tempo real.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="inline-flex p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id, true)}
                  className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-lg bg-[#42b9eb]/15 border border-[#42b9eb]/25"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-4 h-4 transition-colors ${
                      isActive ? "text-[#42b9eb]" : "text-white/35"
                    }`}
                  />
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive ? "text-white" : "text-white/40"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress bar autoplay — oculto quando parado definitivamente */}
          {!stopped && (
            <div className="mt-3 h-[2px] w-full max-w-xs bg-white/[0.05] rounded-full overflow-hidden">
              {isPlaying && (
                <motion.div
                  key={progressKey}
                  className="h-full bg-[#42b9eb]/50 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                />
              )}
            </div>
          )}
        </motion.div>

        {/* Content */}
        {isLoading && <Skeleton />}

        {isError && (
          <div className="flex items-center justify-center py-20">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-8 py-10 text-center max-w-sm">
              <p className="text-white/40 text-sm">Não foi possível carregar os dados.</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && temas && (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                variants={swipeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "temas" ? (
                  <TemasTab temas={temas} onInteract={stopAutoplay} />
                ) : (
                  <PlanosTab temas={temas} onInteract={stopAutoplay} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      <ScrollIndicator href="#analise" />
    </section>
  );
}
