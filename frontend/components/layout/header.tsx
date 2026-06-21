"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/fuel-tanks": "Fuel Inventory",
  "/transactions": "Transactions",
  "/customers": "Customers",
  "/vehicles": "Vehicles",
  "/drivers": "Drivers",
  "/invoices": "Invoices",
  "/expenses": "Expenses",
  "/accounting": "Accounting",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname === path || pathname.startsWith(`${path}/`)
    )?.[1] ?? "FuelManager Pro";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <h1 className="text-lg font-semibold tracking-tight flex-1">{title}</h1>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 h-9 w-64 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground">
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Search...</span>
        <kbd className="ml-auto text-xs border border-border rounded px-1 py-0.5 font-mono">⌘K</kbd>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.first_name?.[0] ?? "U"}
        </div>
      </div>
    </header>
  );
}
