"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, Search, Filter } from "lucide-react";
import { transactionService } from "@/services/transaction-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { TRANSACTION_TYPES } from "@/lib/constants";
import type { Transaction } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  overdue: "bg-rose-500/10 text-rose-500",
  cancelled: "bg-slate-500/10 text-slate-500",
};

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", { search, typeFilter, page }],
    queryFn: () =>
      transactionService.list({
        search,
        page,
        per_page: 25,
        transaction_type: typeFilter || undefined,
      }),
  });

  if (isLoading) return <PageLoader />;

  const transactions = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-screen-xl"
    >
      <PageHeader
        title="Transactions"
        description={`${total} total transactions`}
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all">
            + New Transaction
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 h-9 rounded-lg border border-border bg-muted/50 px-3 text-sm min-w-48">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reference…"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All types</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions found"
          description="Record your first fuel sale or purchase to see it here."
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
                {["Reference", "Type", "Fuel", "Qty (L)", "Amount", "Method", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider first:pl-4"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn: Transaction) => (
                <motion.tr key={txn.id} variants={itemVariants} className="data-table-row">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {txn.reference_number}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      txn.transaction_type === "sale"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-500"
                    )}>
                      {txn.transaction_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                    {txn.fuel_type ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {txn.quantity_liters.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">
                    {formatCurrency(txn.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                    {txn.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      STATUS_STYLES[txn.payment_status] ?? STATUS_STYLES["pending"]
                    )}>
                      {txn.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(txn.created_at)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {(data?.total_pages ?? 0) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page} of {data?.total_pages}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (data?.total_pages ?? 1)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
