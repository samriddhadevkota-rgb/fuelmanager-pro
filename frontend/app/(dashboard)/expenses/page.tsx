"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { expenseService } from "@/services/expense-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { containerVariants, itemVariants, pageVariants } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/formatters";

const CATEGORIES = ["fuel", "maintenance", "insurance", "salaries", "utilities", "rent", "supplies", "other"];

const CATEGORY_COLOR: Record<string, string> = {
  fuel: "bg-amber-500/10 text-amber-400",
  maintenance: "bg-blue-500/10 text-blue-400",
  insurance: "bg-purple-500/10 text-purple-400",
  salaries: "bg-emerald-500/10 text-emerald-400",
  utilities: "bg-cyan-500/10 text-cyan-400",
  rent: "bg-indigo-500/10 text-indigo-400",
  supplies: "bg-orange-500/10 text-orange-400",
  other: "bg-slate-500/10 text-slate-400",
};

const BLANK = { category: "other", description: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), vendor: "", payment_method: "cash", notes: "" };

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [catFilter, setCatFilter] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page, search, catFilter],
    queryFn: () => expenseService.list({ page, per_page: 20, category: catFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => { toast.success("Expense deleted"); qc.invalidateQueries({ queryKey: ["expenses"] }); },
    onError: () => toast.error("Could not delete expense"),
  });

  const createMutation = useMutation({
    mutationFn: (f: typeof form) => expenseService.create({ ...f, amount: parseFloat(f.amount) }),
    onSuccess: () => {
      toast.success("Expense recorded");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setShowForm(false);
      setForm(BLANK);
    },
    onError: () => toast.error("Could not save expense"),
  });

  const totalShown = data?.data.reduce((s, e) => s + e.amount, 0) ?? 0;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and categorize all business expenses"
        action={
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">New Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Amount *</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Description *</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date *</label>
              <input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vendor</label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {["cash", "card", "bank_transfer", "check"].map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.description || !form.amount}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {createMutation.isPending ? "Saving…" : "Save Expense"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Summary banner */}
      {data?.data.length ? (
        <div className="rounded-xl border border-border bg-card px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Showing {data.data.length} of {data.total} expenses</span>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Page total</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalShown)}</p>
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search expenses…"
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCatFilter(catFilter === c ? undefined : c); setPage(1); }}
            className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${catFilter === c ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={Receipt} title="No expenses yet" description="Start tracking your business expenses." />
      ) : (
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Category", "Description", "Amount", "Date", "Vendor", "Method", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map(e => (
                <motion.tr key={e.id} variants={itemVariants} className="data-table-row">
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLOR[e.category] ?? CATEGORY_COLOR.other}`}>{e.category}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-foreground max-w-[200px] truncate">{e.description}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{e.expense_date}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{e.vendor ?? "—"}</td>
                  <td className="px-4 py-3.5 text-muted-foreground capitalize text-xs">{e.payment_method.replace("_", " ")}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate(e.id); }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {(data.total_pages ?? 1) > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground">{data.total} total</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded px-3 py-1 text-xs border border-border disabled:opacity-40 hover:bg-muted">Prev</button>
                <span className="rounded px-3 py-1 text-xs bg-primary text-primary-foreground">{page}</span>
                <button disabled={page === data.total_pages} onClick={() => setPage(p => p + 1)} className="rounded px-3 py-1 text-xs border border-border disabled:opacity-40 hover:bg-muted">Next</button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
