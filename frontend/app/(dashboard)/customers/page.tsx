"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, Mail, Phone, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { customerService } from "@/services/customer-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { pageVariants, containerVariants, itemVariants } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", { search, page }],
    queryFn: () => customerService.list({ search, page, per_page: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
    },
    onError: () => toast.error("Failed to delete customer"),
  });

  if (isLoading) return <PageLoader />;

  const customers = data?.data ?? [];
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
        title="Customers"
        description={`${total} total customers`}
        action={
          <button className="premium-button flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all">
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        }
      />

      {/* Search bar */}
      <div className="flex items-center gap-2 h-10 w-full max-w-sm rounded-lg border border-border bg-muted/50 px-3 text-sm">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search customers…"
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Table */}
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start tracking purchases and issuing invoices."
          action={
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          }
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Credit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Joined</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer: Customer) => (
                <motion.tr
                  key={customer.id}
                  variants={itemVariants}
                  className="data-table-row"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {customer.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        {customer.city && (
                          <p className="text-xs text-muted-foreground">{customer.city}, {customer.country}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      customer.customer_type === "business"
                        ? "bg-indigo-500/10 text-indigo-500"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {customer.customer_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(customer.credit_balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {formatCurrency(customer.credit_limit)} limit
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                    {formatDate(customer.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(customer.id)}
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

          {/* Pagination */}
          {(data?.total_pages ?? 0) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
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
