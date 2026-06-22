"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Check, Zap, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: { monthly: 49, annual: 39 },
    desc: "Perfect for small fleets getting started.",
    color: "from-slate-600 to-slate-700",
    glow: "rgba(100,116,139,0.2)",
    features: ["Up to 5 vehicles", "3 fuel tanks", "Basic analytics", "CSV reports", "Email support", "Mobile app"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Professional",
    price: { monthly: 149, annual: 119 },
    desc: "For growing operations that demand more.",
    color: "from-indigo-500 to-violet-600",
    glow: "rgba(99,102,241,0.35)",
    features: ["Up to 25 vehicles", "Unlimited tanks", "AI predictions", "Advanced reports", "Priority support", "API access", "Custom invoicing", "Multi-location"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 399, annual: 319 },
    desc: "Custom solutions for large fleets.",
    color: "from-violet-600 to-purple-700",
    glow: "rgba(139,92,246,0.2)",
    features: ["Unlimited vehicles", "Unlimited everything", "Dedicated AI model", "White-label option", "Dedicated CSM", "SLA guarantee", "Custom integrations", "Onboarding team"],
    cta: "Contact sales",
    highlight: false,
  },
];

function PricingCard({ plan, index, annual }: { plan: typeof PLANS[0]; index: number; annual: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: plan.highlight ? 1.03 : 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl overflow-hidden group ${plan.highlight ? "ring-1 ring-indigo-500/50" : ""}`}
      style={{ boxShadow: plan.highlight ? `0 0 60px ${plan.glow}, 0 25px 60px rgba(0,0,0,0.5)` : "0 20px 50px rgba(0,0,0,0.4)" }}
    >
      {/* Gradient border */}
      {plan.highlight && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `linear-gradient(135deg, rgba(99,102,241,0.4), rgba(167,139,250,0.2), transparent)`, zIndex: 0 }} />
      )}

      <div className="relative glass-landing p-7 h-full flex flex-col" style={{ zIndex: 1 }}>
        {plan.highlight && (
          <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600">
            <Zap className="h-3 w-3" /> Most Popular
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} mb-4`}
            style={{ boxShadow: `0 8px 20px ${plan.glow}` }}>
            <span className="text-white font-black text-sm">{plan.name[0]}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-white/40 mt-1">{plan.desc}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">${annual ? plan.price.annual : plan.price.monthly}</span>
            <span className="text-white/40 text-sm">/mo</span>
          </div>
          {annual && (
            <p className="text-xs text-emerald-400 mt-1">Save ${(plan.price.monthly - plan.price.annual) * 12}/year</p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-8 flex-1">
          {plan.features.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${plan.color}`}
                style={{ boxShadow: `0 2px 8px ${plan.glow}` }}>
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/register"
          className={`group/btn flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
            plan.highlight
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
              : "glass-landing text-white/70 hover:text-white border border-white/10 hover:border-white/20"
          }`}>
          {plan.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-32 overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 60%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/25 bg-indigo-500/8">
            Pricing
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Simple, <span className="landing-gradient-text">transparent</span> pricing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/40">
            No hidden fees. No surprises. Cancel anytime.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm ${!annual ? "text-white" : "text-white/40"}`}>Monthly</span>
            <button onClick={() => setAnnual(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-indigo-500" : "bg-white/10"}`}>
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-md ${annual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${annual ? "text-white" : "text-white/40"}`}>
              Annual <span className="text-emerald-400 font-bold text-xs ml-1">Save 20%</span>
            </span>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PLANS.map((p, i) => <PricingCard key={p.name} plan={p} index={i} annual={annual} />)}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-12 text-sm text-white/30">
          All plans include a 14-day free trial. No credit card required.
        </motion.div>
      </div>
    </section>
  );
}
