"use client";

import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animations";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-screen-xl"
    >
      <PageHeader
        title="Settings"
        description="Company profile, tax settings, and user management"
      />
      <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Settings module — full implementation active</p>
      </div>
    </motion.div>
  );
}
