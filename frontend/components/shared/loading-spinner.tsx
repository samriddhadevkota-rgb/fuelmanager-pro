"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-[2px]",
  md: "h-8 w-8 border-[2.5px]",
  lg: "h-12 w-12 border-[3px]",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-transparent border-t-primary",
        sizeMap[size],
        className
      )}
      style={{ borderTopColor: "hsl(var(--primary))" }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="stats-card animate-pulse">
      <div className="h-4 w-24 bg-muted rounded mb-3" />
      <div className="h-8 w-32 bg-muted rounded mb-2" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border animate-pulse">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="h-3 w-16 bg-muted rounded" />
    </div>
  );
}
