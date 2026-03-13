"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-mesh-bg" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full bg-primary/[0.04] blur-2xl animate-float-medium" />

      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />

      <motion.div
        className="absolute top-[20%] right-[15%] w-20 h-20 border border-primary/20 rounded-xl"
        animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[25%] left-[10%] w-14 h-14 border border-primary/15 rounded-full"
        animate={{ y: [0, -18, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-[60%] right-[8%] w-10 h-10 border border-border/30 rotate-45"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="section-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary tracking-wider uppercase">
            Secretaria Municipal de Saúde — SUBG
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground leading-[0.95] mb-6"
        >
          Controle de
          <br />
          <span className="text-primary">Metas</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-12"
        >
          Acompanhamento detalhado do Plano de Ação do Tribunal de Contas
          do Município do Rio de Janeiro, com visão estratégica do cumprimento das metas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#panorama"
            className="relative overflow-hidden inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-display font-semibold text-base hover:shadow-[0_0_40px_hsl(189_100%_44%/0.3)] transition-all duration-300 shimmer-line"
          >
            Explorar Panorama
          </a>
          <a
            href="#planos"
            className="inline-flex items-center gap-2 border border-border/50 text-muted-foreground px-6 py-4 rounded-full font-medium text-sm hover:text-foreground hover:border-border transition-all"
          >
            Ver Planos de Ação
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
