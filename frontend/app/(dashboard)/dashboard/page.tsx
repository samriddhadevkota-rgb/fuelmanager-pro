"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { dashboardService } from "@/services/dashboard-service";
import { StatsGrid } from "@/components/shared/stats-grid";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { FuelLevelGauge } from "@/components/dashboard/fuel-level-gauge";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { PageLoader, SkeletonCard } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: dashboardService.getMetrics,
    refetchInterval: 60_000,
  });

  if (isLoading) return <PageLoader />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load dashboard</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }

  const lowStockTanks = data.tank_levels.filter((t) => t.is_low);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-screen-2xl"
    >
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your fuel operations"
        action={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {/* Low stock alert banner */}
      {lowStockTanks.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <strong>{lowStockTanks.length} tank{lowStockTanks.length > 1 ? "s" : ""}</strong>{" "}
            below threshold:{" "}
            {lowStockTanks.map((t) => t.name).join(", ")}. Schedule a refill soon.
          </p>
        </motion.div>
      )}

      {/* KPI cards */}
      <StatsGrid metrics={data} />

      {/* Revenue chart + Tanks */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <RevenueChart data={data.revenue_chart} />
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Tank Levels</h3>
          {data.tank_levels.length === 0 && (
            <p className="text-sm text-muted-foreground">No tanks configured</p>
          )}
          {data.tank_levels.map((tank) => (
            <FuelLevelGauge key={tank.id} tank={tank} />
          ))}
        </motion.div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <RecentTransactions transactions={data.recent_transactions} />
      </motion.div>
    </motion.div>
  );
}
