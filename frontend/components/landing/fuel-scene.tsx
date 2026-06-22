"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

function FuelLiquid({
  pct,
  waveTime,
  mouseXFrac,
  mouseActive,
}: {
  pct: number;
  waveTime: number;
  mouseXFrac: number;
  mouseActive: boolean;
}) {
  const tankX = 30, tankW = 140, tankY = 30, tankH = 390;
  const fillH = (pct / 100) * tankH;
  const fillY = tankY + tankH - fillH;
  const baseAmp = pct > 3 ? 7 : 1;
  const mouseAmp = mouseActive ? 22 : 0;
  const pts = 40;

  let d = `M ${tankX} ${fillY}`;
  for (let i = 0; i <= pts; i++) {
    const xFrac = i / pts;
    const x = tankX + xFrac * tankW;
    const baseSin = Math.sin(waveTime * 2 + xFrac * Math.PI * 5);
    const dist = Math.abs(xFrac - mouseXFrac);
    const mouseEffect = Math.exp(-dist * dist * 18);
    const y = fillY + baseAmp * baseSin + mouseAmp * mouseEffect * Math.sin(waveTime * 6 + xFrac * 8);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L ${tankX + tankW} ${tankY + tankH} L ${tankX} ${tankY + tankH} Z`;

  // Bubbles
  const bubbles: { cx: number; cy: number; r: number }[] = [];
  if (pct > 10) {
    const seeds = [0.2, 0.45, 0.68, 0.82];
    seeds.forEach((xf, i) => {
      const phase = (waveTime * (0.4 + i * 0.15) + i * 1.4) % 1;
      const cy = fillY + phase * fillH;
      if (cy > fillY && cy < tankY + tankH) {
        bubbles.push({ cx: tankX + xf * tankW, cy, r: 2 + i * 1.2 });
      }
    });
  }

  return (
    <>
      <defs>
        <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#3730a3" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="fuelShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <clipPath id="tankClip">
          <rect x={tankX} y={tankY} width={tankW} height={tankH} rx="32" />
        </clipPath>
      </defs>

      {/* Tank fill */}
      <g clipPath="url(#tankClip)">
        {/* Dark background */}
        <rect x={tankX} y={tankY} width={tankW} height={tankH} fill="rgba(5,5,15,0.9)" />
        {/* Liquid */}
        <path d={d} fill="url(#fuelGrad)" />
        {/* Surface shimmer */}
        <path d={d} fill="url(#fuelShine)" />
        {/* Bubbles */}
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="rgba(255,255,255,0.14)" />
        ))}
      </g>

      {/* Tank wall */}
      <rect x={tankX} y={tankY} width={tankW} height={tankH} rx="32"
        fill="none" stroke="rgba(99,102,241,0.35)" strokeWidth="2" />

      {/* Left specular */}
      <rect x={tankX + 8} y={tankY + 10} width={22} height={tankH - 20} rx="11"
        fill="rgba(255,255,255,0.035)" clipPath="url(#tankClip)" />

      {/* Tick marks */}
      {[25, 50, 75].map(p => {
        const ty = tankY + tankH - (p / 100) * tankH;
        return (
          <g key={p}>
            <line x1={tankX + tankW + 4} y1={ty} x2={tankX + tankW + 14} y2={ty}
              stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
            <text x={tankX + tankW + 17} y={ty + 4}
              fill="rgba(99,102,241,0.5)" fontSize="9" fontFamily="monospace">{p}%</text>
          </g>
        );
      })}

      {/* Nozzle pipe at bottom */}
      <rect x={tankX + 54} y={tankY + tankH} width={32} height={14} rx="4"
        fill="rgba(99,102,241,0.25)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <rect x={tankX + 64} y={tankY + tankH + 14} width={12} height={22} rx="3"
        fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.25)" strokeWidth="1" />
    </>
  );
}

function StatCard({ label, value, suffix, prefix, delay }: {
  label: string; value: number; suffix?: string; prefix?: string; delay: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        setTimeout(() => {
          const start = Date.now();
          const dur = 1800;
          const tick = () => {
            const p = Math.min(1, (Date.now() - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(value % 1 === 0 ? Math.round(eased * value) : parseFloat((eased * value).toFixed(1)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, delay);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-black text-white">
        {prefix}{display.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-white/35 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

export function FuelScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tankWrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: false, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const fillPct = useTransform(scrollYProgress, [0.05, 0.65], [0, 87]);
  const [pct, setPct] = useState(0);

  const [waveTime, setWaveTime] = useState(0);
  const animRef = useRef<number>(0);
  const [mouseXFrac, setMouseXFrac] = useState(0.5);
  const [mouseActive, setMouseActive] = useState(false);

  // Drive display pct from scroll
  useEffect(() => fillPct.on("change", v => setPct(Math.max(0, Math.min(100, v)))), [fillPct]);

  // Continuous wave animation
  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.022;
      setWaveTime(t);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current!);
  }, []);

  // Mouse tracking for liquid ripple
  useEffect(() => {
    const el = tankWrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouseXFrac((e.clientX - rect.left) / rect.width);
    };
    const onEnter = () => setMouseActive(true);
    const onLeave = () => setMouseActive(false);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-28 overflow-hidden" style={{ background: "#07070e" }}>
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Aurora blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", animation: "aurora-1 20s ease-in-out infinite" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", animation: "aurora-2 25s ease-in-out infinite" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-landing border border-indigo-500/20 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Live Fuel Intelligence</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Every drop.{" "}
            <span className="landing-gradient-text">Tracked in real-time.</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Hover the tank to disturb the surface. Scroll to fill it up.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-20 justify-center">
          {/* Left: copy + stats */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-10 max-w-sm">
            <div className="space-y-4">
              {[
                { icon: "⚡", title: "Sub-second latency", desc: "Sensor readings hit your dashboard before the nozzle clicks off." },
                { icon: "🔍", title: "Precision metering", desc: "±0.01% accuracy across every pump, every station, every shift." },
                { icon: "🤖", title: "AI anomaly detection", desc: "Machine learning flags theft, leaks, and meter drift automatically." },
              ].map((item, i) => (
                <motion.div key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
                  className="flex gap-4 p-4 rounded-xl glass-landing hover:bg-white/6 transition-colors group">
                  <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-white mb-0.5">{item.title}</div>
                    <div className="text-xs text-white/40 leading-relaxed">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Live counter ticker */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Liters Today" value={47832} suffix=" L" delay={200} />
              <StatCard label="Revenue" value={286} prefix="$" suffix="K" delay={400} />
              <StatCard label="Efficiency" value={94.2} suffix="%" delay={600} />
              <StatCard label="Active Pumps" value={12} delay={800} />
            </div>
          </motion.div>

          {/* Center: Interactive fuel tank */}
          <motion.div
            ref={tankWrapRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative flex flex-col items-center select-none"
            style={{ cursor: "none" }}>

            {/* Percentage badge floating above */}
            <div className="mb-4 relative">
              <div className="text-6xl font-black text-white tabular-nums">
                {Math.round(pct)}<span className="text-3xl text-indigo-400">%</span>
              </div>
              <div className="text-xs text-white/30 text-center uppercase tracking-widest mt-1">Fuel Level</div>
              {pct > 0 && (
                <div className="absolute -right-8 top-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  ● LIVE
                </div>
              )}
            </div>

            {/* SVG tank */}
            <div className="relative" style={{ filter: mouseActive ? "drop-shadow(0 0 30px rgba(99,102,241,0.5))" : "drop-shadow(0 0 15px rgba(99,102,241,0.2))", transition: "filter 0.3s" }}>
              <svg width="220" height="480" viewBox="0 0 200 480" style={{ overflow: "visible" }}>
                <FuelLiquid pct={pct} waveTime={waveTime} mouseXFrac={mouseXFrac} mouseActive={mouseActive} />
              </svg>
            </div>

            {/* Hover hint */}
            <p className="mt-4 text-[11px] text-white/20 text-center">
              {mouseActive ? "← disturbing surface →" : "hover to interact · scroll to fill"}
            </p>
          </motion.div>

          {/* Right: Fuel activity feed */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="space-y-3 max-w-xs w-full">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Live Transactions</div>
            {[
              { vehicle: "TRK-0042", liters: 284, time: "0s ago", type: "Diesel", color: "#6366f1" },
              { vehicle: "TRK-0017", liters: 152, time: "12s ago", type: "Petrol", color: "#8b5cf6" },
              { vehicle: "TRK-0091", liters: 390, time: "45s ago", type: "Diesel", color: "#6366f1" },
              { vehicle: "TRK-0033", liters: 76, time: "2m ago", type: "LPG", color: "#34d399" },
              { vehicle: "TRK-0055", liters: 210, time: "5m ago", type: "Petrol", color: "#8b5cf6" },
            ].map((tx, i) => (
              <motion.div key={tx.vehicle}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl glass-landing border border-white/5 hover:border-indigo-500/20 transition-all group">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
                  style={{ background: `${tx.color}20` }}>⛽</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">{tx.vehicle}</div>
                  <div className="text-[10px] text-white/35">{tx.type} · {tx.time}</div>
                </div>
                <div className="text-xs font-bold tabular-nums" style={{ color: tx.color }}>
                  +{tx.liters}L
                </div>
              </motion.div>
            ))}

            {/* Pulse bar */}
            <div className="flex items-center gap-2 pt-2">
              <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa)" }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                />
              </div>
              <span className="text-[10px] text-white/25">Processing...</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
