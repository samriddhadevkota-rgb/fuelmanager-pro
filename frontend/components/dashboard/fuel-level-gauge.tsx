"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLiters, formatPercent } from "@/lib/formatters";
import type { TankLevelInfo } from "@/types";

interface FuelLevelGaugeProps {
  tank: TankLevelInfo;
}

export function FuelLevelGauge({ tank }: FuelLevelGaugeProps) {
  const pct = Math.min(100, Math.max(0, tank.level_percentage));
  const color =
    pct < 20 ? "bg-rose-500" : pct < 40 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground truncate">{tank.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{tank.fuel_type}</p>
        </div>
        {tank.is_low && (
          <div className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5">
            <AlertTriangle className="h-3 w-3 text-rose-500" />
            <span className="text-xs text-rose-500 font-medium">Low</span>
          </div>
        )}
      </div>

      {/* Bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-2">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatLiters(tank.current_level_liters)} / {formatLiters(tank.capacity_liters)}
        </span>
        <span className={cn("text-xs font-bold", tank.is_low ? "text-rose-500" : "text-foreground")}>
          {formatPercent(pct)}
        </span>
      </div>
    </div>
  );
}
