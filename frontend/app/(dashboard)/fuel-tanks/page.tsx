"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Fuel } from "lucide-react";
import { fuelTankService } from "@/services/fuel-tank-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FuelLevelGauge } from "@/components/dashboard/fuel-level-gauge";
import { PageLoader } from "@/components/shared/loading-spinner";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";

export default function FuelTanksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["fuel-tanks"],
    queryFn: fuelTankService.list,
  });

  if (isLoading) return <PageLoader />;

  const tanks = data?.data ?? [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-screen-xl"
    >
      <PageHeader
        title="Fuel Inventory"
        description={`${tanks.length} tank${tanks.length !== 1 ? "s" : ""} configured`}
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all">
            + Add Tank
          </button>
        }
      />

      {tanks.length === 0 ? (
        <EmptyState
          icon={Fuel}
          title="No fuel tanks configured"
          description="Add your first storage tank to start tracking inventory levels and refills."
          action={
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
              + Add Tank
            </button>
          }
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {tanks.map((tank) => (
            <motion.div key={tank.id} variants={itemVariants}>
              <FuelLevelGauge tank={tank} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
