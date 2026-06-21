import type { ReactNode } from "react";
import { Zap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-mesh grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-indigo-500/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">{APP_NAME}</span>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="space-y-3">
            <p className="text-xl font-medium text-white leading-relaxed">
              "The most elegant fuel management platform we've ever used. Revenue visibility went up 40% in the first month."
            </p>
            <footer className="text-sm text-indigo-300">
              <strong className="text-white">Sarah K.</strong> · Operations Director, FleetCo
            </footer>
          </blockquote>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Fuel Tracked", value: "2.4M L" },
            { label: "Revenue Managed", value: "$8.2M" },
            { label: "Companies", value: "1,200+" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-indigo-300 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
