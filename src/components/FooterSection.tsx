"use client";

import { motion } from "framer-motion";

export function FooterSection() {
  return (
    <footer className="py-16 border-t border-border/20">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-sm text-foreground">
              Prefeitura Rio <span className="text-primary">|</span> Saúde
            </span>
            <span className="text-border">•</span>
            <span className="font-display font-bold text-xs text-primary tracking-wider">TCMRio</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Subsecretaria Geral — SUBG</span>
            <span>•</span>
            <span>Controle de Metas 2025</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
