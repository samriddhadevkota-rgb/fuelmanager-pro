"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "FuelManager Pro completely transformed how we run our 40-truck operation. We cut fuel costs by 22% in the first quarter alone. Nothing else comes close.",
    name: "Marcus Johnson",
    title: "Operations Director",
    company: "SwiftHaul Logistics",
    avatar: "MJ",
    color: "#6366f1",
    stars: 5,
  },
  {
    quote: "The AI forecasting is genuinely impressive. It predicted a tank shortage 4 days before it happened. We've never run dry since switching to FuelManager Pro.",
    name: "Priya Sharma",
    title: "Fleet Manager",
    company: "Apex Fuel Services",
    avatar: "PS",
    color: "#8b5cf6",
    stars: 5,
  },
  {
    quote: "The financial reports alone are worth the subscription. What used to take my accountant two days is now automatic. The P&L view is stunning.",
    name: "Thomas Mueller",
    title: "CFO",
    company: "EuroFreight GmbH",
    avatar: "TM",
    color: "#3b82f6",
    stars: 5,
  },
  {
    quote: "We evaluated six platforms. FuelManager Pro was the only one that felt like it was actually built for fuel businesses, not repurposed from something else.",
    name: "Sarah Chen",
    title: "CEO",
    company: "Pacific Tank Co.",
    avatar: "SC",
    color: "#06b6d4",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-amber-400 text-xs">★</span>
      ))}
    </div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0c0b18 50%, #0a0a0f 100%)" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/25 bg-amber-500/8">
            ★ Testimonials
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Loved by fleet<br /><span className="landing-gradient-text">operators worldwide.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/40">
            Join 12,000+ operators who switched to FuelManager Pro.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-landing rounded-2xl p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.4)" }}>

              {/* Top glow accent */}
              <div className="absolute top-0 left-6 right-6 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${t.color}60, transparent)` }} />

              <Stars count={t.stars} />

              <blockquote className="mt-4 text-sm text-white/55 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`, boxShadow: `0 4px 12px ${t.color}40` }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-white/35">{t.title} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-12">
          <p className="w-full text-center text-xs text-white/25 uppercase tracking-widest mb-4">Trusted by companies worldwide</p>
          {["SwiftHaul", "Apex Fuel", "EuroFreight", "Pacific Tank", "RoadRunner", "FuelFirst"].map(name => (
            <span key={name} className="text-sm font-bold text-white/15 hover:text-white/30 transition-colors cursor-default select-none tracking-tight">
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
