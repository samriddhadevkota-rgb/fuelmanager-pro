"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { containerVariants, itemVariants } from "@/lib/animations";
import type { RecentTransaction } from "@/types";

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  overdue: "bg-rose-500/10 text-rose-500",
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
        <a href="/transactions" className="text-xs text-primary hover:underline">
          View all
        </a>
      </div>
      <motion.ul variants={containerVariants} initial="initial" animate="animate">
        {transactions.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            No transactions yet
          </li>
        )}
        {transactions.map((txn) => (
          <motion.li
            key={txn.id}
            variants={itemVariants}
            className="data-table-row flex items-center gap-3 px-6 py-3"
          >
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                txn.transaction_type === "sale"
                  ? "bg-emerald-500/10"
                  : "bg-rose-500/10"
              )}
            >
              {txn.transaction_type === "sale" ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownLeft className="h-3.5 w-3.5 text-rose-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {txn.reference_number}
              </p>
              <p className="text-xs text-muted-foreground">
                {txn.customer_name ?? "Walk-in"} · {formatRelativeTime(txn.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(txn.total_amount)}
              </p>
              <span
                className={cn(
                  "text-xs rounded-full px-2 py-0.5 font-medium",
                  STATUS_COLORS[txn.payment_status] ?? STATUS_COLORS["pending"]
                )}
              >
                {txn.payment_status}
              </span>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
