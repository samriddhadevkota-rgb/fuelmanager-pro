"use client";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { TrendingUp, Fuel, Users, Truck, Activity, AlertCircle } from "lucide-react";

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
    </div>
  );
}

function BarGraph() {
  const bars = [65, 82, 54, 91, 78, 88, 95, 71, 83, 97, 74, 89];
  return (
    <div className="flex items-end gap-1.5 h-16">
      {bars.map((h, i) => (
        <motion.div key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 rounded-t-sm"
          style={{ background: i === bars.length - 1 ? "linear-gradient(to top, #6366f1, #a78bfa)" : "rgba(99,102,241,0.25)", boxShadow: i === bars.length - 1 ? "0 0 8px rgba(99,102,241,0.5)" : "none" }}
        />
      ))}
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, color, delta }: { icon: React.ElementType; label: string; value: string; color: string; delta?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-white">{value}</span>
        {delta && <span className="text-[10px] text-emerald-400 ml-2">{delta}</span>}
      </div>
    </div>
  );
}

export function DashboardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return (
    <section id="dashboard" ref={sectionRef} className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0d0b1a 50%, #0a0a0f 100%)" }}>

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-violet-400 border border-violet-500/25 bg-violet-500/8">
            Dashboard
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Your business.<br /><span className="landing-gradient-text">Crystal clear.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/40 max-w-xl mx-auto">
            Every metric, every transaction, every truck — unified in one command center.
          </motion.p>
        </div>

        {/* 3D Dashboard mockup */}
        <motion.div style={{ y, scale }} className="relative max-w-5xl mx-auto">
          {/* Perspective wrapper */}
          <div className="relative" style={{ perspective: "1200px" }}>
            <motion.div
              initial={{ opacity: 0, rotateX: 15, y: 80 }}
              animate={headerInView ? { opacity: 1, rotateX: 4, y: 0 } : {}}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ transformStyle: "preserve-3d" }}>

              {/* Main dashboard panel */}
              <div className="relative glass-landing-strong rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.1)" }}>

                {/* Chrome bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex gap-1.5">
                    {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />)}
                  </div>
                  <div className="flex-1 mx-3 h-5 rounded-md bg-white/5 flex items-center justify-center">
                    <span className="text-[10px] text-white/25">FuelManager Pro — Live Dashboard</span>
                  </div>
                  <LiveBadge />
                </div>

                {/* Dashboard grid */}
                <div className="p-6 grid grid-cols-12 gap-4">
                  {/* KPI row */}
                  {[
                    { icon: TrendingUp, label: "Revenue", value: "$127,450", delta: "+24.5%", color: "#6366f1" },
                    { icon: Fuel, label: "Fuel Dispensed", value: "48,200 L", delta: "+8.2%", color: "#8b5cf6" },
                    { icon: Truck, label: "Active Fleet", value: "24 / 26", delta: "92.3%", color: "#3b82f6" },
                    { icon: Users, label: "Customers", value: "1,284", delta: "+15", color: "#06b6d4" },
                  ].map(kpi => (
                    <div key={kpi.label} className="col-span-3 rounded-xl p-4"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] text-white/40 uppercase tracking-wide">{kpi.label}</p>
                        <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}25` }}>
                          <kpi.icon className="h-3 w-3" style={{ color: kpi.color }} />
                        </div>
                      </div>
                      <p className="text-xl font-black text-white">{kpi.value}</p>
                      <p className="text-[11px] text-emerald-400 mt-1 font-medium">{kpi.delta}</p>
                    </div>
                  ))}

                  {/* Chart area */}
                  <div className="col-span-8 rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-white">Revenue Analytics</p>
                        <p className="text-[11px] text-white/35 mt-0.5">Monthly breakdown</p>
                      </div>
                      <div className="flex gap-2">
                        {["1W","1M","3M","1Y"].map((t, i) => (
                          <button key={t} className={`text-[11px] px-2.5 py-1 rounded-md ${i === 1 ? "bg-indigo-500/20 text-indigo-400 font-bold" : "text-white/30 hover:text-white/60"}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <BarGraph />
                    <div className="flex justify-between mt-2">
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => (
                        <span key={m} className="text-[9px] text-white/20">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right column: metrics */}
                  <div className="col-span-4 rounded-xl p-4 space-y-0"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-white">Live Metrics</p>
                      <Activity className="h-4 w-4 text-indigo-400" />
                    </div>
                    <MetricRow icon={Fuel} label="Tank A" value="87%" color="#6366f1" delta="OK" />
                    <MetricRow icon={Fuel} label="Tank B" value="34%" color="#f59e0b" delta="LOW" />
                    <MetricRow icon={Truck} label="Routes" value="148" color="#3b82f6" />
                    <MetricRow icon={AlertCircle} label="Alerts" value="2" color="#ef4444" />
                  </div>
                </div>
              </div>

              {/* Shadow beneath card */}
              <div className="absolute -bottom-8 left-10 right-10 h-8 rounded-full blur-2xl"
                style={{ background: "rgba(99,102,241,0.3)" }} />
            </motion.div>
          </div>

          {/* Floating accent cards */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute -left-20 top-1/2 -translate-y-1/2 w-48 glass-landing rounded-xl p-4"
            style={{ animation: "float-slow 7s ease-in-out infinite", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">AI Forecast</p>
            <p className="text-sm font-bold text-white">Refill in 3 days</p>
            <p className="text-[11px] text-indigo-400 mt-1">Tank B · 94% confidence</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="absolute -right-16 top-1/3 w-44 glass-landing rounded-xl p-4"
            style={{ animation: "float-medium 5s ease-in-out infinite 1s", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">New transaction</p>
            </div>
            <p className="text-sm font-bold text-white">+$1,840</p>
            <p className="text-[11px] text-white/40 mt-0.5">Fleet Express · Diesel</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
