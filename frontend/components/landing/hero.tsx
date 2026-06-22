"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Zap } from "lucide-react";
import { ThreeHero } from "./three-hero";
import { MagneticButton } from "./magnetic-button";

// ── ScrambleText ──────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#⚡◈◉●";

function ScrambleText({ text, delay = 700 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState(() => text.split("").map(() => " "));
  const started = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      let frame = 0;
      const chars = text.split("");
      const total = chars.length * 4 + 20;
      const id = setInterval(() => {
        frame++;
        setDisplayed(chars.map((ch, i) => {
          if (ch === " ") return " ";
          if (frame > i * 4 + 12) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }));
        if (frame >= total) clearInterval(id);
      }, 45);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <>{displayed.join("")}</>;
}

// ── AnimCounter ───────────────────────────────────────────────────────────────
function AnimCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now(), dur = 2000;
        const tick = () => {
          const p = Math.min(1, (Date.now() - t0) / dur);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#0a0a0f" }}>

      {/* Three.js 3D scene — full background */}
      <ThreeHero sectionRef={sectionRef} />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 1,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Vignette — darkens edges so text pops */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 2,
        background: "radial-gradient(ellipse 70% 90% at 20% 50%, transparent 40%, rgba(10,10,15,0.75) 100%)",
      }} />

      {/* Left-side content */}
      <div className="relative max-w-7xl mx-auto px-6 w-full pt-28 pb-20" style={{ zIndex: 10 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-xl space-y-8">

          {/* Beta badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-landing border border-indigo-500/30">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #34d399" }} />
              <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">Now in Public Beta</span>
              <Zap className="h-3 w-3 text-indigo-400" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} className="space-y-1">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
              <span className="block text-white">Fuel Ops,</span>
              <span className="block landing-gradient-text font-mono">
                <ScrambleText text="Reinvented." delay={700} />
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-lg text-white/45 leading-relaxed">
            Enterprise fleet management, real-time fuel tracking, and AI-powered financial intelligence —
            in one cinematic platform.
          </motion.p>

          {/* CTAs — magnetic */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <MagneticButton strength={0.35} radius={110}>
              <Link href="/register"
                className="group relative flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white overflow-hidden"
                style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", boxShadow: "0 0 32px rgba(99,102,241,0.45), 0 4px 20px rgba(0,0,0,0.35)" }}>
                <span>Start for free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={0.3} radius={100}>
              <button className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white glass-landing transition-colors">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 group-hover:bg-indigo-500/30 transition-colors">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </div>
                Watch demo
              </button>
            </MagneticButton>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-8 pt-1">
            {[
              { value: 12000, suffix: "+",  label: "Fleet operators" },
              { value: 2.4,   suffix: "B",  prefix: "$", label: "Revenue tracked" },
              { value: 99.9,  suffix: "%",  label: "Uptime SLA" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">
                  <AnimCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Trust avatars */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {["#6366f1","#8b5cf6","#3b82f6","#06b6d4","#10b981"].map((c, i) => (
                <div key={i} className="h-7 w-7 rounded-full border-2 border-[#0a0a0f]"
                  style={{ background: c, zIndex: 5 - i }} />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
            </div>
            <span className="text-xs text-white/35">Loved by 12,000+ operators</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 10 }}>
        <span className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Scroll to explore</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}
