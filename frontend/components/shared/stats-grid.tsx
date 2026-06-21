"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { formatCurrency, formatTrendBadge } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MetricCard } from "@/types";

interface StatsGridProps {
  metrics: {
    revenue: MetricCard;
    expenses: MetricCard;
    profit: MetricCard;
    transactions_count: MetricCard;
  };
}

export function StatsGrid({ metrics }: StatsGridProps) {
  const cards = [
    {
      key: "revenue",
      metric: metrics.revenue,
      color: "from-indigo-500 to-purple-600",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "expenses",
      metric: metrics.expenses,
      color: "from-rose-500 to-pink-600",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "profit",
      metric: metrics.profit,
      color: "from-emerald-500 to-teal-600",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "transactions",
      metric: metrics.transactions_count,
      color: "from-amber-500 to-orange-600",
      format: (v: number) => v.toLocaleString(),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {cards.map(({ key, metric, color, format }) => {
        const trend = formatTrendBadge(metric.change_pct);
        return (
          <motion.div key={key} variants={itemVariants} className="stats-card group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {metric.label}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                  trend.positive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                )}
              >
                {trend.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.label}
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {format(metric.value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              vs {format(metric.previous_value)} last month
            </p>
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl bg-gradient-to-r opacity-60",
                color
              )}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
