"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Fuel, Twitter, Github, Linkedin, ArrowRight } from "lucide-react";

const LINKS = {
  Product: ["Features", "Dashboard", "Pricing", "Integrations", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Security", "GDPR", "Cookie Policy"],
  Resources: ["Documentation", "API Reference", "Status Page", "Support", "Community"],
};

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer className="relative overflow-hidden bg-[#07070d]">
      {/* Top aurora */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)" }} />
      <div className="absolute top-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden my-16 p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 0 60px rgba(99,102,241,0.1)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)" }} />
          <h2 className="relative text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to transform your fleet?
          </h2>
          <p className="relative text-white/40 mb-8">Start your free 14-day trial. No credit card required.</p>
          <div className="relative flex flex-wrap justify-center gap-4">
            <Link href="/register"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:scale-105 active:scale-95 transition-all"
              style={{ boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}>
              Get started for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white glass-landing transition-all hover:scale-105">
              Sign in to dashboard
            </Link>
          </div>
        </motion.div>

        {/* Main footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-6 gap-8 py-12 border-t border-white/5">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                <Fuel className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-black text-white tracking-tight">FuelManager <span className="text-indigo-400">Pro</span></span>
            </Link>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs">
              The operating system for fuel-driven businesses. Track, manage, and grow — all in one place.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href}
                  className="flex h-8 w-8 items-center justify-center rounded-lg glass-landing text-white/40 hover:text-white hover:bg-white/8 transition-all">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">{section}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-white/5 text-xs text-white/25">
          <span>© 2026 FuelManager Pro. All rights reserved.</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
            <span>All systems operational</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
