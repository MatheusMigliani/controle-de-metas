"use client";

/**
 * LogoBlobVariants.tsx
 *
 * Três variações de container estilo "blob" para o bloco institucional
 * "Uma iniciativa de" no HeroSection.
 *
 * Stack: Next.js 14 · Tailwind CSS · Framer Motion · next/image
 *
 * Cores utilizadas (alinhadas ao branding do projeto):
 *   Blob fill:     hsl(213, 58%, 11%)  →  hsl(213, 65%, 18%)
 *   Glow/borda:    hsl(189, 100%, 44%) — cyan primário do design system
 *
 * Animação de entrada padrão: opacity 0→1, y -12→0
 *
 * -------------------------------------------------------------------
 * RECOMENDAÇÃO: use <BlobOrganico /> — leia o comentário da variação.
 * -------------------------------------------------------------------
 */

import { motion } from "framer-motion";
import Image from "next/image";

// ─── Constantes compartilhadas ────────────────────────────────────────────────

const ENTRADA = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as number[] },
};

// Cores do blob extraídas dos tokens do projeto
const BLOB_BG_FROM = "hsl(213, 58%, 11%)"; // --background do :root
const BLOB_BG_TO   = "hsl(213, 65%, 18%)"; // um passo mais claro, cria profundidade
const CYAN         = "hsl(189, 100%, 44%)"; // --primary do design system

// ─── Conteúdo interno (igual para as 3 variações) ────────────────────────────

function LogosInterior() {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Label */}
      <span
        className="text-[8px] font-semibold uppercase tracking-[0.22em] leading-none font-body"
        style={{ color: `hsl(189, 100%, 70%)` }} // cyan claro sobre fundo escuro
      >
        Uma iniciativa de
      </span>

      {/* Logos + separador */}
      <div className="flex items-center gap-3.5">
        {/* SMS Rio — versão branca (fundo escuro garante legibilidade) */}
        <Image
          src="/brand/logobranca.png"
          alt="Prefeitura Rio — Secretaria Municipal de Saúde"
          width={110}
          height={28}
          className="object-contain"
          priority
        />

        {/* Separador vertical */}
        <div
          className="h-6 w-px shrink-0"
          style={{ background: `hsla(189, 100%, 44%, 0.35)` }}
          aria-hidden
        />

        {/* TCMRio — invertida para branco no fundo escuro */}
        <Image
          src="/brand/tcmrio-logo.png"
          alt="TCMRio — Tribunal de Contas do Município do Rio de Janeiro"
          width={88}
          height={18}
          className="object-contain brightness-0 invert opacity-80"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIAÇÃO 1 — Blob Orgânico com border-radius assimétrico
// ═══════════════════════════════════════════════════════════════════════════════
//
// RECOMENDADO para este projeto.
//
// Por quê: É a abordagem mais alinhada ao vocabulário visual já existente
// (SpotlightCard usa border-radius 1.5rem, os badges usam rounded-full).
// O shape assimétrico é suficientemente orgânico para quebrar a rigidez
// do grid sem exigir SVG inline nem clipPath — o que simplifica a manutenção
// e preserva a responsividade natural do Tailwind.
//
// O glow cyan usa box-shadow multicamada: a primeira camada simula uma borda
// translúcida luminosa, a segunda cria o halo difuso externo.
//
// Uso no HeroSection.tsx:
//   Substitua o bloco <motion.div> que contém o "w-fit mb-2" (linhas 54-87)
//   pelo componente abaixo. Remova também o `useTheme` se ele só servia
//   para alternar as logos — o blob elimina essa necessidade.
// ───────────────────────────────────────────────────────────────────────────────

export function BlobOrganico() {
  return (
    <motion.div
      {...ENTRADA}
      className="w-fit mb-2"
      style={{
        // Shape orgânico: dois pares de raios independentes (horizontal / vertical)
        borderRadius: "62% 38% 54% 46% / 52% 62% 38% 48%",
        background: `linear-gradient(135deg, ${BLOB_BG_FROM} 0%, ${BLOB_BG_TO} 100%)`,
        // Glow cyan: borda luminosa interna + halo externo difuso
        boxShadow: [
          `inset 0 0 0 1px hsl(189 100% 44% / 0.22)`, // borda translúcida
          `0 0 0 1px hsl(213 58% 11% / 0.6)`,          // sombra de separação do fundo
          `0 0 18px 2px hsl(189 100% 44% / 0.12)`,     // halo externo suave
          `0 4px 24px hsl(213 58% 6% / 0.5)`,          // sombra de profundidade
        ].join(", "),
        padding: "18px 28px 20px 24px",
      }}
    >
      <LogosInterior />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIAÇÃO 2 — Blob com SVG clipPath
// ═══════════════════════════════════════════════════════════════════════════════
//
// Quando usar: quando você precisar de um shape radicalmente irregular
// (assimétrico em dois eixos) que border-radius não consegue reproduzir,
// ou quando o designer entregou um path específico no Figma.
//
// Trade-off: requer coordenadas SVG fixas — o shape não redimensiona
// automaticamente com o conteúdo. Use `preserveAspectRatio` com cuidado
// e defina uma área de clip maior do que o conteúdo esperado.
//
// O SVG é renderizado invisível (w-0 h-0 absolute) e o clipPath é
// referenciado pelo id "blob-clip-v2". O container tem padding generoso
// para garantir que nenhum conteúdo seja cortado pelo clip.
// ───────────────────────────────────────────────────────────────────────────────

export function BlobSvgClip() {
  return (
    <motion.div {...ENTRADA} className="w-fit mb-2 relative">
      {/* Definição do SVG clipPath — invisível, apenas declarativa */}
      <svg
        className="absolute w-0 h-0 overflow-hidden"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id="blob-clip-v2" clipPathUnits="objectBoundingBox">
            {/*
              Path normalizado (0..1). Shape: blob levemente oval
              com indentação suave no canto superior direito.
              Derivado de: https://blobs.dev (seed customizado)
            */}
            <path d="M0.82,0.08 C0.95,0.18 1.02,0.38 0.98,0.57 C0.94,0.76 0.79,0.92 0.61,0.97 C0.43,1.02 0.22,0.97 0.10,0.84 C-0.02,0.71 -0.02,0.50 0.06,0.33 C0.14,0.16 0.33,0.04 0.52,0.01 C0.67,-0.01 0.69,-0.02 0.82,0.08 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Camada de fundo (recebe o clip) */}
      <div
        style={{
          clipPath: "url(#blob-clip-v2)",
          background: `linear-gradient(145deg, ${BLOB_BG_FROM} 0%, ${BLOB_BG_TO} 100%)`,
          // Dimensões fixas: ajuste se o conteúdo mudar
          width: 320,
          height: 108,
          display: "flex",
          alignItems: "center",
          padding: "0 32px 0 28px",
        }}
      >
        <LogosInterior />
      </div>

      {/* Glow overlay — anel cyan renderizado sobre o clip, sem clipPath */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: "url(#blob-clip-v2)",
          boxShadow: "none", // box-shadow não funciona com clipPath
          // Alternativa: background gradient radial para simular glow interno
          background: `radial-gradient(ellipse at 80% 20%, hsl(189 100% 44% / 0.10) 0%, transparent 60%)`,
        }}
        aria-hidden
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIAÇÃO 3 — Squircle / Pill Geométrico Arredondado
// ═══════════════════════════════════════════════════════════════════════════════
//
// Quando usar: quando o contexto visual da página é mais estruturado e
// os demais cards/badges já têm shapes geométricos precisos (como é o caso
// aqui — SpotlightCard, badges do carousel). O pill comunica "institucional
// e confiável", enquanto o blob orgânico comunica "moderno e dinâmico".
//
// Este shape usa border-radius uniforme (pill alongado), borda fina com
// gradiente cyan e um glow concentrado no topo-esquerdo para criar
// a ilusão de fonte de luz interna — técnica usada em Liquid Glass UIs.
//
// A faixa lateral cyan da esquerda (já existente no HeroSection original)
// é mantida como elemento decorativo externo ao blob.
// ───────────────────────────────────────────────────────────────────────────────

export function BlobGeometrico() {
  return (
    <motion.div {...ENTRADA} className="w-fit mb-2 flex items-stretch gap-0">
      {/* Faixa lateral cyan — mantém a identidade visual do componente original */}
      <div
        className="w-[3px] rounded-full mr-4 self-stretch shrink-0"
        style={{
          background: `linear-gradient(to bottom, ${CYAN}, hsl(200, 100%, 42%), hsl(189, 100%, 44% / 0.2))`,
        }}
        aria-hidden
      />

      {/* Pill container */}
      <div
        style={{
          // Squircle: border-radius alto em todos os cantos → shape de pill largo
          borderRadius: "24px",
          background: `linear-gradient(135deg, ${BLOB_BG_FROM} 0%, ${BLOB_BG_TO} 100%)`,
          boxShadow: [
            // Borda fina com gradiente simulado via dois box-shadows
            `0 0 0 1px hsl(189 100% 44% / 0.20)`,
            // Glow de topo — simula fonte de luz interna (Liquid Glass)
            `inset 0 1px 0 hsl(189 100% 80% / 0.12)`,
            // Sombra de profundidade externa
            `0 8px 28px hsl(213 58% 6% / 0.55)`,
            // Halo externo muito sutil
            `0 0 20px 0px hsl(189 100% 44% / 0.08)`,
          ].join(", "),
          padding: "14px 24px 16px 20px",
        }}
      >
        <LogosInterior />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHOWCASE — componente de visualização das 3 variações lado a lado
// (remova do build final; use apenas para comparação em dev)
// ═══════════════════════════════════════════════════════════════════════════════

export function LogoBlobShowcase() {
  const labels = [
    { label: "V1 · Blob Orgânico", sub: "RECOMENDADO", Component: BlobOrganico },
    { label: "V2 · SVG clipPath",  sub: "Shape livre", Component: BlobSvgClip },
    { label: "V3 · Pill Geométrico", sub: "Estilo institucional", Component: BlobGeometrico },
  ];

  return (
    <div className="flex flex-col gap-12 p-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[hsl(213,58%,8%)] dark:to-[hsl(213,58%,14%)] min-h-screen">
      {labels.map(({ label, sub, Component }) => (
        <div key={label} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white/80 uppercase tracking-widest">
              {label}
            </span>
            <span className="text-[10px] font-body text-slate-400 dark:text-white/30">
              {sub}
            </span>
          </div>
          <Component />
        </div>
      ))}
    </div>
  );
}
