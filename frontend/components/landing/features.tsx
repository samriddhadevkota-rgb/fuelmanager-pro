"use client";
import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Fuel, BarChart3, Truck, Brain, FileText, Plug, TrendingUp, Shield, Clock } from "lucide-react";

const FEATURES = [
  {
    icon: Fuel,
    title: "Real-Time Fuel Tracking",
    desc: "Automated sensor readings, low-stock alerts, and theft detection across all tanks. Never run dry again.",
    color: "from-indigo-500 to-blue-600",
    glow: "rgba(99,102,241,0.25)",
    tag: "Core",
  },
  {
    icon: BarChart3,
    title: "Financial Intelligence",
    desc: "Automated P&L statements, smart invoicing, and expense categorization. Your accountant will be impressed.",
    color: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.25)",
    tag: "Finance",
  },
  {
    icon: Truck,
    title: "Fleet Management",
    desc: "Vehicles, drivers, routes, and maintenance schedules unified in one view. Full operational control.",
    color: "from-blue-500 to-cyan-600",
    glow: "rgba(59,130,246,0.25)",
    tag: "Fleet",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    desc: "Demand forecasting, anomaly detection, and route optimization powered by machine learning models.",
    color: "from-pink-500 to-rose-600",
    glow: "rgba(236,72,153,0.25)",
    tag: "AI",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    desc: "Daily, weekly, and monthly reports compiled and delivered automatically. Zero manual effort.",
    color: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.25)",
    tag: "Reports",
  },
  {
    icon: Plug,
    title: "50+ Integrations",
    desc: "QuickBooks, Xero, Stripe, GPS systems, fuel cards, and more. Works with your existing stack.",
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.25)",
    tag: "Integrations",
  },
];

const EXTRA = [
  { icon: Shield, text: "Bank-grade security & SOC 2 compliant" },
  { icon: TrendingUp, text: "99.9% uptime with global CDN" },
  { icon: Clock, text: "Setup in under 10 minutes" },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const directions = [
    { x: -60, y: 0 }, { x: 0, y: 60 }, { x: 60, y: 0 },
    { x: -60, y: 0 }, { x: 0, y: 60 }, { x: 60, y: 0 },
  ];
  const d = directions[index] || { x: 0, y: 60 };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: d.x, y: d.y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl p-px overflow-hidden cursor-default"
      style={{ background: inView ? `linear-gradient(135deg, ${feature.glow.replace("0.25","0.4")}, transparent 60%)` : "rgba(255,255,255,0.05)" }}
    >
      <div className="relative rounded-2xl p-6 h-full transition-all duration-300 group-hover:bg-white/3"
        style={{ background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)" }}>

        {/* Tag */}
        <div className="flex items-center justify-between mb-5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
            style={{ boxShadow: `0 8px 24px ${feature.glow}` }}>
            <feature.icon className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
            {feature.tag}
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
        <p className="text-sm text-white/45 leading-relaxed">{feature.desc}</p>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${feature.glow.replace("0.25","0.6")}, transparent)` }} />
      </div>
    </motion.div>
  );
}

export function Features() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 bg-[#0a0a0f] overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)" }} />

      {/* Subtle horizontal line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/25 bg-indigo-500/8">
            Everything you need
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Why <span className="landing-gradient-text">FuelManager Pro?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            The only platform built specifically for fuel-driven businesses. Not adapted — purpose-built.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>

        {/* Bottom trust bar */}
        <div className="flex flex-wrap justify-center gap-8 pt-6 border-t border-white/6">
          {EXTRA.map(e => (
            <div key={e.text} className="flex items-center gap-2.5 text-sm text-white/40">
              <e.icon className="h-4 w-4 text-indigo-400 shrink-0" />
              {e.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
