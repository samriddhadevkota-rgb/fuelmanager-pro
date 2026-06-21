"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Send, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { invoiceService } from "@/services/invoice-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { INVOICE_STATUSES } from "@/lib/constants";
import type { Invoice } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-500",
  sent: "bg-blue-500/10 text-blue-500",
  partial: "bg-amber-500/10 text-amber-500",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  overdue: "bg-rose-500/10 text-rose-500",
  cancelled: "bg-red-900/20 text-red-400",
};

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", { statusFilter, page }],
    queryFn: () =>
      invoiceService.list({ page, per_page: 20, status: statusFilter || undefined }),
  });

  const sendMutation = useMutation({
    mutationFn: invoiceService.send,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice sent to customer");
    },
    onError: () => toast.error("Failed to send invoice"),
  });

  const deleteMutation = useMutation({
    mutationFn: invoiceService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");
    },
  });

  if (isLoading) return <PageLoader />;

  const invoices = data?.data ?? [];
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
        title="Invoices"
        description={`${total} total invoices`}
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all">
            + New Invoice
          </button>
        }
      />

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {[{ value: "", label: "All" }, ...INVOICE_STATUSES].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === value
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-accent text-muted-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create your first invoice and send it directly to your customers."
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
                {["Invoice #", "Customer", "Issue Date", "Due Date", "Amount", "Paid", "Status", ""].map(
                  (h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: Invoice) => (
                <motion.tr key={inv.id} variants={itemVariants} className="data-table-row">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {inv.customer_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(inv.issue_date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(inv.due_date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">
                    {formatCurrency(inv.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatCurrency(inv.amount_paid)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      STATUS_STYLES[inv.status] ?? STATUS_STYLES["draft"]
                    )}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {inv.status === "draft" && (
                        <button
                          onClick={() => sendMutation.mutate(inv.id)}
                          title="Send invoice"
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-blue-500/10 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5 text-muted-foreground hover:text-blue-500" />
                        </button>
                      )}
                      {inv.pdf_url && (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                        >
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(inv.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
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
