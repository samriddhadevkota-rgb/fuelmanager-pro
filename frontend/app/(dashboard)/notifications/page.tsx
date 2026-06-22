"use client";

import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/notification-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { containerVariants, itemVariants, pageVariants } from "@/lib/animations";
import { formatRelativeTime } from "@/lib/formatters";
import { useState } from "react";

const TYPE_ICON: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
};

const TYPE_COLOR: Record<string, string> = {
  info: "text-blue-400 bg-blue-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  success: "text-emerald-400 bg-emerald-500/10",
  error: "text-rose-400 bg-rose-500/10",
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page, unreadOnly],
    queryFn: () => notificationService.list({ page, per_page: 30, unread_only: unreadOnly }),
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) => notificationService.markRead(ids),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => { toast.success("All marked as read"); qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });

  const unreadCount = data?.data.filter(n => !n.is_read).length ?? 0;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <PageHeader
        title="Notifications"
        description="System alerts, low-stock warnings, and activity updates"
        action={
          unreadCount > 0 ? (
            <button onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          ) : null
        }
      />

      <div className="flex gap-3">
        <button onClick={() => { setUnreadOnly(false); setPage(1); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!unreadOnly ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
          All
        </button>
        <button onClick={() => { setUnreadOnly(true); setPage(1); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${unreadOnly ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
          Unread {unreadCount > 0 && <span className="ml-1.5 rounded-full bg-rose-500 text-white text-xs px-1.5 py-0.5">{unreadCount}</span>}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={Bell} title="No notifications" description={unreadOnly ? "You're all caught up!" : "No notifications yet."} />
      ) : (
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-2">
          {data.data.map(n => {
            const Icon = TYPE_ICON[n.notification_type] ?? Info;
            const color = TYPE_COLOR[n.notification_type] ?? TYPE_COLOR.info;
            return (
              <motion.div key={n.id} variants={itemVariants}
                onClick={() => { if (!n.is_read) markReadMutation.mutate([n.id]); }}
                className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${n.is_read ? "border-border bg-card opacity-60" : "border-primary/20 bg-primary/5"}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className={`text-sm font-medium ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(n.created_at)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                </div>
                {!n.is_read && <div className="h-2 w-2 shrink-0 mt-1 rounded-full bg-primary" />}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {(data?.total_pages ?? 1) > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded px-3 py-1 text-xs border border-border disabled:opacity-40 hover:bg-muted">Prev</button>
          <span className="rounded px-3 py-1 text-xs bg-primary text-primary-foreground">{page} / {data?.total_pages}</span>
          <button disabled={page === data?.total_pages} onClick={() => setPage(p => p + 1)} className="rounded px-3 py-1 text-xs border border-border disabled:opacity-40 hover:bg-muted">Next</button>
        </div>
      )}
    </motion.div>
  );
}
