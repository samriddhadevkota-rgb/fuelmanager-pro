"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn("flex items-start justify-between gap-4 mb-6", className)}
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
