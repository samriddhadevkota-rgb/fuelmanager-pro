"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { FileText, Download, Calendar, BarChart2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/shared/page-header";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  action: () => Promise<unknown>;
  formats?: string[];
}

function StatusBadge({ status }: { status: "idle" | "pending" | "success" | "error" }) {
  if (status === "idle") return null;
  const map = {
    pending: { icon: Loader2, label: "Queuing…", cls: "text-amber-400 animate-spin" },
    success: { icon: CheckCircle2, label: "Queued!", cls: "text-emerald-400" },
    error: { icon: AlertCircle, label: "Failed", cls: "text-rose-400" },
  };
  const { icon: Icon, label, cls } = map[status];
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium">
      <Icon className={`h-3.5 w-3.5 ${cls}`} />
      {label}
    </span>
  );
}

export default function ReportsPage() {
  const [fmt, setFmt] = useState("csv");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const transactionExport = useMutation({
    mutationFn: () => apiClient.post(`/reports/transactions/export?fmt=${fmt}`),
    onSuccess: () => toast.success("Transaction report queued — check back shortly"),
    onError: () => toast.error("Could not queue report"),
  });

  const dailySummary = useMutation({
    mutationFn: () => apiClient.post("/reports/daily", { start_date: startDate, end_date: endDate }),
    onSuccess: () => toast.success("Daily summary report queued"),
    onError: () => toast.error("Could not queue report"),
  });

  const cards = [
    {
      id: "transactions",
      icon: Download,
      title: "Transaction Export",
      description: "Export all fuel transactions to CSV or PDF. Report is generated asynchronously and will be available for download.",
      color: "from-indigo-500 to-violet-600",
      extra: (
        <div className="mt-4 flex items-center gap-3">
          {["csv", "pdf"].map(f => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="fmt" value={f} checked={fmt === f} onChange={() => setFmt(f)} className="accent-primary" />
              <span className="text-sm text-muted-foreground uppercase">{f}</span>
            </label>
          ))}
        </div>
      ),
      mutation: transactionExport,
      label: "Export Transactions",
    },
    {
      id: "daily",
      icon: Calendar,
      title: "Daily Summary Report",
      description: "Generate a daily operations summary: total volume dispensed, revenue, number of transactions, and per-tank breakdown.",
      color: "from-emerald-500 to-teal-600",
      extra: (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      ),
      mutation: dailySummary,
      label: "Generate Summary",
    },
  ] as const;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-3xl">
      <PageHeader
        title="Reports"
        description="Generate and export data reports — jobs run in the background via Celery"
      />

      {/* Info banner */}
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex items-start gap-3 text-sm text-muted-foreground">
        <BarChart2 className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
        <div>
          <p className="font-medium text-foreground">Async report generation</p>
          <p className="mt-0.5">Reports are queued in the Celery task queue and processed by a background worker. Large exports may take a few minutes.</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid gap-5">
        {cards.map(card => (
          <motion.div key={card.id} variants={itemVariants} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <StatusBadge status={card.mutation.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                {card.extra}
                <button
                  onClick={() => card.mutation.mutate()}
                  disabled={card.mutation.isPending}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all">
                  {card.mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Queuing…</> : <><FileText className="h-4 w-4" />{card.label}</>}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Placeholder for download links */}
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <Download className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Generated reports will appear here once the Celery worker completes the job.</p>
      </div>
    </motion.div>
  );
}
