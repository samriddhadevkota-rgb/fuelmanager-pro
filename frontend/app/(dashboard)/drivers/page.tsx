"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Plus, Search, Trash2, Phone, Mail, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { driverService } from "@/services/driver-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { containerVariants, itemVariants, pageVariants } from "@/lib/animations";
import { formatDate } from "@/lib/formatters";

const STATUS_COLOR: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  inactive: "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20",
  suspended: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20",
};

const BLANK = { first_name: "", last_name: "", email: "", phone: "", license_number: "", license_expiry: "", employee_id: "" };

export default function DriversPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  const { data, isLoading } = useQuery({
    queryKey: ["drivers", page, search, statusFilter],
    queryFn: () => driverService.list({ page, per_page: 20, search: search || undefined, status: statusFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: driverService.delete,
    onSuccess: () => { toast.success("Driver removed"); qc.invalidateQueries({ queryKey: ["drivers"] }); },
    onError: () => toast.error("Could not delete driver"),
  });

  const createMutation = useMutation({
    mutationFn: driverService.create,
    onSuccess: () => {
      toast.success("Driver added");
      qc.invalidateQueries({ queryKey: ["drivers"] });
      setShowForm(false);
      setForm(BLANK);
    },
    onError: () => toast.error("Could not create driver"),
  });

  const fields: { key: keyof typeof form; label: string; required?: boolean }[] = [
    { key: "first_name", label: "First Name", required: true },
    { key: "last_name", label: "Last Name", required: true },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "license_number", label: "License Number" },
    { key: "license_expiry", label: "License Expiry (YYYY-MM-DD)" },
    { key: "employee_id", label: "Employee ID" },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <PageHeader
        title="Drivers"
        description="Manage fleet drivers and license records"
        action={
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">New Driver</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, required }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{label}{required && " *"}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.first_name || !form.last_name}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {createMutation.isPending ? "Saving…" : "Save Driver"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search drivers…"
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {["active", "inactive", "suspended"].map(s => (
          <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? undefined : s); setPage(1); }}
            className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={UserCheck} title="No drivers yet" description="Add your first driver to track fleet assignments." />
      ) : (
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Driver", "Contact", "License", "Employee ID", "Status", "Added", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map(d => (
                <motion.tr key={d.id} variants={itemVariants} className="data-table-row">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {d.first_name[0]}{d.last_name[0]}
                      </div>
                      <span className="font-medium text-foreground">{d.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      {d.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{d.email}</div>}
                      {d.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{d.phone}</div>}
                      {!d.email && !d.phone && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs"><BadgeCheck className="h-3 w-3 text-primary" />{d.license_number ?? "—"}</div>
                      {d.license_expiry && <div className="text-xs text-muted-foreground">Exp: {d.license_expiry}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{d.employee_id ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLOR[d.status] ?? STATUS_COLOR.inactive}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(d.created_at)}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => { if (confirm(`Remove ${d.full_name}?`)) deleteMutation.mutate(d.id); }}
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
