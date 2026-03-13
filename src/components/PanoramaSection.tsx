"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { etapas, planos } from "@/lib/mock-data";
import { useMemo } from "react";
import { Layers, CheckCircle2, Clock, FileText, RotateCcw, CircleDot } from "lucide-react";
import { type LucideIcon } from "lucide-react";

function StatCard({ label, value, icon: Icon, color, delay }: { label: string; value: number; icon: LucideIcon; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="glass-panel p-6 group hover:border-primary/30 transition-colors duration-500"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-current/10`}>
          <Icon className="w-5 h-5" style={{ color: 'currentColor' }} />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <AnimatedCounter value={value} className={`text-4xl ${color}`} />
    </motion.div>
  );
}

export function PanoramaSection() {
  const stats = useMemo(() => {
    const total = etapas.length;
    const naoIniciadas = etapas.filter((e) => e.status === "Não Iniciada").length;
    const emAndamento = etapas.filter((e) => e.status === "Em Andamento").length;
    const concluidas = etapas.filter((e) => e.status === "Concluída").length;
    const docGerado = etapas.filter((e) => e.status === "Documento Gerado").length;
    const aguardando = etapas.filter((e) => e.status === "Aguardando retorno da área").length;
    const pct = total > 0 ? Math.round(((concluidas + docGerado) / total) * 100 * 10) / 10 : 0;
    return { total, naoIniciadas, emAndamento, concluidas, docGerado, aguardando, pct };
  }, []);

  return (
    <section id="panorama" className="py-32 relative">
      <div className="absolute inset-0 gradient-mesh-bg" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-3 block">Panorama Geral</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Visão em Números
          </h2>
          <p className="text-muted-foreground max-w-lg text-lg">
            {planos.length} planos de ação monitorados com {etapas.length} etapas em acompanhamento contínuo.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          <StatCard label="Total de Etapas" value={stats.total} icon={Layers} color="text-primary" delay={0} />
          <StatCard label="Não Iniciadas" value={stats.naoIniciadas} icon={CircleDot} color="text-status-nao-iniciada" delay={0.08} />
          <StatCard label="Em Andamento" value={stats.emAndamento} icon={Clock} color="text-status-andamento" delay={0.16} />
          <StatCard label="Concluídas" value={stats.concluidas} icon={CheckCircle2} color="text-status-concluida" delay={0.24} />
          <StatCard label="Doc. Gerado" value={stats.docGerado} icon={FileText} color="text-status-documento" delay={0.32} />
          <StatCard label="Aguardando" value={stats.aguardando} icon={RotateCcw} color="text-status-aguardando" delay={0.4} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Progresso Global</span>
              <div className="flex items-baseline gap-2 mt-1">
                <AnimatedCounter value={stats.pct} className="text-6xl md:text-7xl text-primary" suffix="" />
                <span className="text-2xl text-primary font-display">%</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">das etapas concluídas ou com documento gerado</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Áreas</span>
                <span className="font-display font-bold text-2xl text-foreground">{new Set(planos.map(p => p.area)).size}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Planos</span>
                <span className="font-display font-bold text-2xl text-foreground">{planos.length}</span>
              </div>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${stats.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
