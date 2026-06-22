"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Fuel, Menu, X } from "lucide-react";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(10,10,15,0)", "rgba(10,10,15,0.92)"]);
  const blur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(20px)"]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.15]);

  useEffect(() => {
    const unsub = scrollY.onChange(v => setScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#dashboard", label: "Dashboard" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Customers" },
  ];

  return (
    <motion.nav
      style={{ backgroundColor: bg, backdropFilter: blur }}
      className="fixed top-0 left-0 right-0 z-50 transition-all"
    >
      <motion.div
        style={{ borderBottomColor: `rgba(255,255,255,${borderOpacity})` }}
        className="border-b"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <Fuel className="h-4 w-4 text-white" />
              <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-bold text-white tracking-tight">FuelManager <span className="text-indigo-400">Pro</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a key={l.href} href={l.href}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                {l.label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register"
              className="relative px-5 py-2 text-sm font-semibold text-white rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Get started free →</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(v => !v)} className="md:hidden p-2 text-white/70 hover:text-white">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile drawer */}
      {open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 space-y-2">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="px-4 py-2.5 text-sm text-white/70 text-center">Sign in</Link>
            <Link href="/register" className="px-4 py-2.5 text-sm font-semibold text-white text-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600">
              Get started free
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
