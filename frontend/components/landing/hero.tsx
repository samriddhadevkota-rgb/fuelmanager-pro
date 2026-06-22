"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Play, TrendingUp, Zap, Shield } from "lucide-react";
import { ParticleCanvas } from "./particle-canvas";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#⚡◈◉●";

function ScrambleText({ text, delay = 600 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState(() => text.split("").map(() => " "));
  const started = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      let frame = 0;
      const chars = text.split("");
      const totalFrames = chars.length * 4 + 20;
      const id = setInterval(() => {
        frame++;
        setDisplayed(chars.map((ch, i) => {
          if (ch === " ") return " ";
          if (frame > i * 4 + 12) return ch;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }));
        if (frame >= totalFrames) clearInterval(id);
      }, 45);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);

  return <>{displayed.join("")}</>;
}

function useMouseParallax(strength = 0.02) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 16 });
  const sy = useSpring(my, { stiffness: 60, damping: 16 });
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mx.set((e.clientX - window.innerWidth / 2) * strength);
      my.set((e.clientY - window.innerHeight / 2) * strength);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mx, my, strength]);
  return [sx, sy] as const;
}

function AnimCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const dur = 2000;
        const tick = () => {
          const p = Math.min(1, (Date.now() - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(eased * target));
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

function MiniChart() {
  return (
    <svg viewBox="0 0 200 60" className="w-full h-14" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path d="M0,55 L0,45 C20,42 35,38 50,30 C65,22 80,28 100,20 C120,12 140,16 160,8 C175,3 185,4 200,2 L200,55 Z"
        fill="url(#chartGrad)" />
      <path d="M0,45 C20,42 35,38 50,30 C65,22 80,28 100,20 C120,12 140,16 160,8 C175,3 185,4 200,2"
        fill="none" stroke="url(#lineGrad)" strokeWidth="2"
        strokeDasharray="600" strokeDashoffset="600">
        <animate attributeName="strokeDashoffset" from="600" to="0" dur="2s" begin="0.3s" fill="freeze" />
      </path>
      {[50,100,160,200].map((x, i) => (
        <circle key={i} cx={x} cy={[30,20,8,2][i]} r="3" fill="#a78bfa">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${0.3 + i * 0.4}s`} fill="freeze" />
        </circle>
      ))}
    </svg>
  );
}

export function Hero() {
  const [px] = useMouseParallax(32);
  const [px2] = useMouseParallax(48);
  const [px3] = useMouseParallax(20);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0f]">
      {/* Aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", animation: "aurora-1 18s ease-in-out infinite", willChange: "transform" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)", animation: "aurora-2 22s ease-in-out infinite", willChange: "transform" }} />
        <div className="absolute top-[30%] left-[30%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", animation: "aurora-3 26s ease-in-out infinite", willChange: "transform" }} />
      </div>

      {/* Particle field */}
      <ParticleCanvas />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        backgroundSize: "80px 80px" }} />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 w-full pt-24 pb-20" style={{ zIndex: 10 }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

          {/* LEFT — copy */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-landing border border-indigo-500/30">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #34d399" }} />
                <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">Now in Public Beta</span>
                <Zap className="h-3 w-3 text-indigo-400" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                <span className="block text-white">Fuel Ops,</span>
                <span className="block landing-gradient-text font-mono">
                  <ScrambleText text="Reinvented." delay={700} />
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p variants={itemVariants} className="text-lg text-white/50 max-w-md leading-relaxed">
              Enterprise-grade fleet management, real-time fuel tracking, and AI-powered financial intelligence — in one cinematic platform.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link href="/register"
                className="group relative flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", boxShadow: "0 0 30px rgba(99,102,241,0.4), 0 4px 15px rgba(0,0,0,0.3)" }}>
                <span>Start for free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <button className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white glass-landing transition-all hover:scale-105 active:scale-95">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 group-hover:bg-indigo-500/30 transition-colors">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </div>
                Watch demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-8 pt-2">
              {[
                { value: 12000, suffix: "+", label: "Fleet operators" },
                { value: 2.4, suffix: "B", prefix: "$", label: "Revenue tracked" },
                { value: 99.9, suffix: "%", label: "Uptime SLA" },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white">
                    <AnimCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Trust logos */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {["#6366f1","#8b5cf6","#3b82f6","#06b6d4","#10b981"].map((c, i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-[#0a0a0f]" style={{ background: c, zIndex: 5 - i }} />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
              </div>
              <span className="text-xs text-white/40">Loved by 12,000+ operators</span>
            </motion.div>
          </motion.div>

          {/* RIGHT — floating dashboard */}
          <div className="relative hidden lg:block h-[600px]">
            {/* Glow behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", animation: "pulse-glow 4s ease-in-out infinite" }} />

            {/* Main dashboard card
                CSS float on wrapper div — Framer Motion entry+parallax on inner motion.div
                This avoids inline-style vs CSS-animation transform conflicts */}
            <div className="absolute top-[8%] left-[5%] right-[5%]" style={{ animation: "float-slow 6s ease-in-out infinite" }}>
              <motion.div
                style={{ x: px, boxShadow: "0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.1)" }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="glass-landing-strong rounded-2xl overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                  <div className="flex gap-1.5">
                    {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />)}
                  </div>
                  <div className="flex-1 mx-4 h-5 rounded bg-white/5 flex items-center px-2">
                    <span className="text-[10px] text-white/30">app.fuelmanager.pro/dashboard</span>
                  </div>
                  <Shield className="h-3 w-3 text-emerald-400" />
                </div>
                {/* Dashboard content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-white/40 uppercase tracking-wider">Monthly Revenue</p>
                      <p className="text-3xl font-black text-white mt-0.5">$127,450</p>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">+24.5%</span>
                    </div>
                  </div>
                  <MiniChart />
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Tanks", value: "87%", color: "#6366f1" },
                      { label: "Trucks", value: "24", color: "#8b5cf6" },
                      { label: "Trips", value: "148", color: "#3b82f6" },
                    ].map(m => (
                      <div key={m.label} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] text-white/35 uppercase tracking-wider">{m.label}</p>
                        <p className="text-lg font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top-right satellite: Fuel level */}
            <div className="absolute top-[2%] right-[-8%] w-52" style={{ animation: "float-medium 5s ease-in-out infinite 1s" }}>
              <motion.div
                style={{ x: px2, boxShadow: "0 15px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                className="glass-landing rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-xs">⛽</span>
                  </div>
                  <span className="text-[11px] font-semibold text-white/70">Tank A — Diesel</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">7,800 / 10,000 L</span>
                    <span className="text-indigo-400 font-bold">78%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: "78%", background: "linear-gradient(90deg, #6366f1, #a78bfa)", boxShadow: "0 0 8px rgba(99,102,241,0.6)" }}>
                      <div className="h-full w-full animate-pulse opacity-60 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom-left satellite: Fleet status */}
            <div className="absolute bottom-[5%] left-[-5%] w-56" style={{ animation: "float-fast 4s ease-in-out infinite 0.5s" }}>
              <motion.div
                style={{ x: px3, boxShadow: "0 15px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                className="glass-landing rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-white/70">🚛 Fleet Status</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-white">24</span>
                  <span className="text-sm text-white/30">/ 26 active</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <div key={i} className="h-2 w-2 rounded-full" style={{ background: i < 12 ? "#10b981" : "#374151", boxShadow: i < 12 ? "0 0 4px #10b981" : "none" }} />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* AI alert */}
            <div className="absolute top-[48%] right-[-12%] w-44" style={{ animation: "float-medium 7s ease-in-out infinite 2s" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="glass-landing rounded-xl p-3"
                style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">AI Insight</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">Refill Tank B before Thursday — 94% confidence</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[11px] text-white/25 uppercase tracking-widest">Scroll to explore</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
