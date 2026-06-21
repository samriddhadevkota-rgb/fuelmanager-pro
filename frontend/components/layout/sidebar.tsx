"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Fuel, ArrowLeftRight, Users, Truck,
  UserCheck, FileText, Receipt, BookOpen, BarChart3,
  Bell, Settings, ChevronLeft, ChevronRight, Zap, LogOut,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { sidebarVariants } from "@/lib/animations";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fuel-tanks", label: "Fuel Inventory", icon: Fuel },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/vehicles", label: "Vehicles", icon: Truck },
  { href: "/drivers", label: "Drivers", icon: UserCheck },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/accounting", label: "Accounting", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarCollapsed ? "closed" : "open"}
      initial={false}
      className="relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border min-h-[65px]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-sm text-foreground tracking-tight whitespace-nowrap overflow-hidden"
            >
              {APP_NAME}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "sidebar-item",
                  active ? "sidebar-item-active" : "sidebar-item-inactive"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-2 py-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={logout}
          className="sidebar-item sidebar-item-inactive w-full text-left text-destructive hover:text-destructive"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        {user && !sidebarCollapsed && (
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md hover:text-foreground transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
