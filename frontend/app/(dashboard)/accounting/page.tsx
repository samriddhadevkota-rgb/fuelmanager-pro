"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";
import { formatCurrency } from "@/lib/formatters";

interface PLData {
  year: number;
  revenue: number;
  expenses: number;
  gross_profit: number;
  margin_pct: number;
  monthly: { month: string; revenue: number; expenses: number; profit: number }[];
}

export default function AccountingPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data, isLoading } = useQuery<PLData>({
    queryKey: ["accounting", "pl", year],
    queryFn: () => apiClient.get(`/accounting/pl`, { year }),
  });

  const kpis = data ? [
    { label: "Total Revenue", value: formatCurrency(data.revenue), icon: DollarSign, trend: "up", color: "text-emerald-400" },
    { label: "Total Expenses", value: formatCurrency(data.expenses), icon: TrendingDown, trend: "down", color: "text-rose-400" },
    { label: "Gross Profit", value: formatCurrency(data.gross_profit), icon: TrendingUp, trend: data.gross_profit >= 0 ? "up" : "down", color: data.gross_profit >= 0 ? "text-emerald-400" : "text-rose-400" },
    { label: "Profit Margin", value: `${data.margin_pct}%`, icon: BarChart3, trend: data.margin_pct >= 0 ? "up" : "down", color: data.margin_pct >= 15 ? "text-emerald-400" : "text-amber-400" },
  ] : [];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-screen-2xl">
      <PageHeader
        title="Accounting"
        description="Profit & Loss statement — revenue vs expenses over time"
        action={
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Year</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : !data ? null : (
        <>
          {/* KPI cards */}
          <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <motion.div key={kpi.label} variants={itemVariants} className="stats-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.color} bg-current/10`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{year} full year</p>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl bg-gradient-to-r ${kpi.trend === "up" ? "from-emerald-500 to-emerald-400" : "from-rose-500 to-rose-400"}`} />
              </motion.div>
            ))}
          </motion.div>

          {/* Revenue vs Expenses chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-6">Monthly Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.monthly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fill="url(#colorExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly profit bar chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-6">Monthly Net Profit</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="profit" name="Net Profit" radius={[4, 4, 0, 0]}
                  fill="#6366f1"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly breakdown table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Monthly Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Month", "Revenue", "Expenses", "Net Profit", "Margin"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.monthly.map(row => {
                  const margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
                  return (
                    <tr key={row.month} className="data-table-row">
                      <td className="px-4 py-3 font-medium text-foreground">{row.month}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">{formatCurrency(row.revenue)}</td>
                      <td className="px-4 py-3 text-rose-400">{formatCurrency(row.expenses)}</td>
                      <td className={`px-4 py-3 font-semibold ${row.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatCurrency(row.profit)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[80px]">
                            <div className={`h-full rounded-full ${margin >= 0 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${Math.min(Math.abs(margin), 100)}%` }} />
                          </div>
                          <span className={`text-xs ${margin >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{margin.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
}
