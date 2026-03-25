"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/metas-api";
import type { ApiDashboardStats } from "@/lib/types";

export function TemporalSection() {
  const [data, setData] = useState<ApiDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(
    () =>
      (data?.evolucaoMensal ?? []).map((m) => ({
        name: m.mes,
        "Em Andamento": m.emAndamento,
        Concluídas: m.concluidas,
      })),
    [data]
  );

  return (
    <section id="analise" className="py-32 relative">
      <div className="absolute inset-0 gradient-mesh-bg" />
      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <span className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-3 block">
            Análise Temporal
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Visão Consolidada
          </h2>
          <p className="text-muted-foreground max-w-lg text-lg">
            Evolução mensal e calendário de metas integrados em uma só visão.
          </p>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-6 md:p-10"
        >
          {loading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground text-sm">
              Carregando dados...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(213 30% 20%)"
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "hsl(213 20% 50%)",
                    fontSize: 11,
                    fontFamily: "Inter",
                  }}
                  axisLine={{ stroke: "hsl(213 30% 20%)" }}
                />
                <YAxis
                  tick={{
                    fill: "hsl(213 20% 50%)",
                    fontSize: 11,
                    fontFamily: "Inter",
                  }}
                  axisLine={{ stroke: "hsl(213 30% 20%)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(213 50% 12%)",
                    border: "1px solid hsl(213 30% 22%)",
                    borderRadius: "12px",
                    color: "hsl(210 33% 97%)",
                    fontFamily: "Inter",
                    fontSize: 13,
                  }}
                />
                <Legend
                  payload={[
                    { value: "Em Andamento", type: "rect", color: "hsl(43 96% 56%)" },
                    { value: "Concluídas", type: "rect", color: "hsl(189 100% 44%)" },
                  ]}
                  wrapperStyle={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    color: "hsl(213 20% 55%)",
                  }}
                />
                <Bar
                  dataKey="Em Andamento"
                  fill="hsl(43 96% 56%)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="Concluídas"
                  fill="hsl(189 100% 44%)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </section>
  );
}
