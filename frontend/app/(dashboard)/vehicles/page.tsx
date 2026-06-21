"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types";
import type { PaginatedResponse } from "@/types/api";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  maintenance: "bg-amber-500/10 text-amber-500",
  inactive: "bg-slate-500/10 text-slate-500",
};

export default function VehiclesPage() {
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", { page }],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Vehicle>>("/vehicles", { page, per_page: 20 } as Record<string, unknown>),
  });

  if (isLoading) return <PageLoader />;

  const vehicles = data?.data ?? [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-screen-xl"
    >
      <PageHeader
        title="Vehicles"
        description={`${data?.total ?? 0} registered vehicles`}
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all">
            + Add Vehicle
          </button>
        }
      />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No vehicles registered"
          description="Add vehicles to track fuel consumption, mileage, and driver assignments."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="rounded-xl border border-border overflow-hidden bg-card"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Vehicle", "Plate", "Fuel Type", "Mileage", "Status", "Added"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: Vehicle) => (
                <motion.tr key={v.id} variants={itemVariants} className="data-table-row">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Unknown"}
                    </p>
                    {v.color && <p className="text-xs text-muted-foreground capitalize">{v.color}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {v.license_plate}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{v.fuel_type}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {v.current_mileage_km.toLocaleString()} km
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[v.status] ?? STATUS_STYLES["active"])}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(v.created_at)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
