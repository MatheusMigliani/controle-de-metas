"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, AlertCircle, Send, Bell, FileText } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse, NewsletterSubscriber } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSection() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await api.post<ApiResponse<NewsletterSubscriber>>("/newsletter/subscribe", {
        email: email.trim(),
        nome: nome.trim(),
      });
      setStatus("success");
      setNome("");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setErrorMsg(axiosErr.response?.data?.error ?? "Erro ao se inscrever. Tente novamente.");
    }
  }

  return (
    <section id="newsletter" className="relative py-20 md:py-28">
      {/* Top divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#42b9eb]/25 to-transparent" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Main card */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            {/* Glows */}
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#42b9eb]/[0.08] blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#2a688f]/[0.12] blur-[60px] pointer-events-none" />

            {/* Tech corners */}
            <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#42b9eb]/30 pointer-events-none" />
            <span className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#42b9eb]/30 pointer-events-none" />
            <span className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#42b9eb]/30 pointer-events-none" />
            <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#42b9eb]/30 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-0">
              {/* Left — copy & features */}
              <div className="relative p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                {/* Subtle grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: "linear-gradient(rgba(66,185,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(66,185,235,0.5) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <div className="relative z-10">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#42b9eb]/20 bg-[#42b9eb]/[0.06] text-[#42b9eb] text-[10px] font-mono tracking-wider uppercase mb-5">
                      <Bell size={10} />
                      Fique por dentro
                    </span>
                  </motion.div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white font-display leading-tight mb-3">
                    Receba as atualizações
                    <br />
                    <span className="text-[#42b9eb]">no seu e-mail</span>
                  </h3>

                  <p className="text-white/45 text-sm leading-relaxed mb-8 max-w-sm">
                    Inscreva-se e receba resumos periódicos dos documentos aprovados e movidos para a pasta oficial.
                  </p>

                  {/* Feature pills */}
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: FileText, text: "Resumo dos documentos aprovados" },
                      { icon: Send, text: "Envio automático e periódico" },
                      { icon: Mail, text: "Cancele quando quiser" },
                    ].map(({ icon: Icon, text }, i) => (
                      <motion.div
                        key={text}
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#42b9eb]/[0.08] border border-[#42b9eb]/10 flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-[#42b9eb]/70" />
                        </div>
                        <span className="text-[13px] text-white/50">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — form */}
              <div className="relative p-8 md:p-10 lg:p-12 md:border-l border-t md:border-t-0 border-white/[0.06] flex items-center">
                {/* Accent line on top (mobile) / left (desktop) */}
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-2/3 bg-gradient-to-b from-transparent via-[#42b9eb]/20 to-transparent" />

                <div className="w-full">
                  {status === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="flex flex-col items-center text-center py-8 gap-4"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                        <CheckCircle2 size={26} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white mb-1">
                          Inscrição confirmada!
                        </p>
                        <p className="text-sm text-white/40 max-w-xs">
                          Você receberá os próximos resumos de documentos aprovados diretamente no seu e-mail.
                        </p>
                      </div>
                      <button
                        onClick={() => setStatus("idle")}
                        className="text-xs text-[#42b9eb]/60 hover:text-[#42b9eb] transition-colors mt-2"
                      >
                        Inscrever outro e-mail
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-[#42b9eb]/10 border border-[#42b9eb]/15 flex items-center justify-center shrink-0">
                          <Mail size={16} className="text-[#42b9eb]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Newsletter</h4>
                          <p className="text-[11px] text-white/30">Preencha abaixo para se inscrever</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Seu nome completo"
                            required
                            maxLength={200}
                            className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#42b9eb]/25 focus:border-[#42b9eb]/25 focus:bg-white/[0.06] transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            maxLength={255}
                            className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#42b9eb]/25 focus:border-[#42b9eb]/25 focus:bg-white/[0.06] transition-all"
                          />
                        </div>
                      </div>

                      {status === "error" && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/15 text-rose-400 text-xs"
                        >
                          <AlertCircle size={13} className="shrink-0" />
                          {errorMsg}
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={status === "loading" || !nome.trim() || !email.trim()}
                        className="group w-full py-3 rounded-xl text-sm font-semibold bg-[#42b9eb] text-white hover:bg-[#42b9eb]/90 hover:shadow-[0_0_24px_rgba(66,185,235,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                        {status === "loading" ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        )}
                        Inscrever-se na Newsletter
                      </button>

                      <p className="text-[10px] text-white/20 text-center leading-relaxed">
                        Você pode cancelar a inscrição a qualquer momento através do link no e-mail.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
