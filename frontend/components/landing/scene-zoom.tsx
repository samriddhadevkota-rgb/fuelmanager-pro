"use client";
import { useEffect, useRef } from "react";
import { TrendingUp, Fuel, Truck, ArrowLeftRight } from "lucide-react";

export function SceneZoom() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dashRef    = useRef<HTMLDivElement>(null);
  const stat1Ref   = useRef<HTMLDivElement>(null);
  const stat2Ref   = useRef<HTMLDivElement>(null);
  const stat3Ref   = useRef<HTMLDivElement>(null);
  const card1Ref   = useRef<HTMLDivElement>(null);
  const card2Ref   = useRef<HTMLDivElement>(null);
  const card3Ref   = useRef<HTMLDivElement>(null);
  const card4Ref   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killFn: (() => void) | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);

        // Initial hidden states
        gsap.set(dashRef.current, { scale: 0.26, rotateX: 28, z: -600, opacity: 0.5 });
        gsap.set([stat1Ref.current, stat2Ref.current, stat3Ref.current], { opacity: 0, y: 50 });
        gsap.set([card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current],
          { opacity: 0, scale: 0.7, y: 40 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=280%",
            scrub: 1.6,
            pin: true,
          },
        });

        // Phase 1 — camera zooms into dashboard (0 → 0.38)
        tl.to(dashRef.current, {
          scale: 1, rotateX: 0, z: 0, opacity: 1,
          ease: "power3.out", duration: 0.38,
        }, 0);

        // Phase 2 — top stats fly in (0.3 → 0.55)
        tl.to([stat1Ref.current, stat2Ref.current, stat3Ref.current], {
          opacity: 1, y: 0,
          stagger: 0.07,
          ease: "back.out(1.7)",
          duration: 0.25,
        }, 0.32);

        // Phase 3 — bottom cards assemble with spring physics (0.5 → 0.78)
        tl.to([card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current], {
          opacity: 1, scale: 1, y: 0,
          stagger: 0.06,
          ease: "elastic.out(1, 0.7)",
          duration: 0.35,
        }, 0.5);

        // Phase 4 — cards drift apart (0.78 → 1.0) — "cards separate"
        tl.to(card1Ref.current, { x: -260, y: -30, rotateY: 12, ease: "power2.out", duration: 0.22 }, 0.78);
        tl.to(card2Ref.current, { x: -80,  y: -30, rotateY: 6,  ease: "power2.out", duration: 0.22 }, 0.80);
        tl.to(card3Ref.current, { x:  80,  y: -30, rotateY: -6, ease: "power2.out", duration: 0.22 }, 0.82);
        tl.to(card4Ref.current, { x:  260, y: -30, rotateY: -12,ease: "power2.out", duration: 0.22 }, 0.84);

        killFn = () => ScrollTrigger.getAll().forEach(t => t.kill());
      }
    );

    return () => killFn?.();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#06060e", perspective: "1400px", perspectiveOrigin: "50% 40%" }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />

      {/* Label */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-2">Scene I — Dashboard Zoom</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white">Your command centre. <span className="landing-gradient-text">Live.</span></h2>
      </div>

      {/* Dashboard mockup */}
      <div
        ref={dashRef}
        className="relative w-full max-w-5xl mx-4 z-10"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}>

        <div className="glass-landing-strong rounded-2xl overflow-hidden p-6 space-y-5"
          style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.08)" }}>

          {/* Window chrome */}
          <div className="flex items-center gap-2 pb-4 border-b border-white/8">
            <div className="flex gap-1.5">
              {["#ff5f57", "#febc2e", "#28c840"].map(c =>
                <div key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
              )}
            </div>
            <div className="flex-1 mx-4 h-5 rounded bg-white/5 flex items-center px-3">
              <span className="text-[10px] text-white/25">app.fuelmanager.pro / dashboard</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold">Live</span>
            </div>
          </div>

          {/* Hero KPI row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/35 uppercase tracking-wider mb-1">Monthly Revenue</p>
              <p className="text-5xl font-black text-white">$127,450</p>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">+24.5% vs last month</span>
              </div>
            </div>

            {/* Top stats */}
            <div className="flex gap-4">
              {[
                { ref: stat1Ref, icon: Fuel,         label: "Tanks",  value: "87%",   color: "#6366f1" },
                { ref: stat2Ref, icon: Truck,         label: "Fleet",  value: "24/26", color: "#8b5cf6" },
                { ref: stat3Ref, icon: ArrowLeftRight, label: "Trips",  value: "148",   color: "#3b82f6" },
              ].map(({ ref, icon: Icon, label, value, color }) => (
                <div key={label} ref={ref}
                  className="text-center px-5 py-3 rounded-xl"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} />
                  <div className="text-xl font-black text-white">{value}</div>
                  <div className="text-[10px] text-white/35 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-36 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)" }}>
            <svg className="w-full h-full" viewBox="0 0 900 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="zcg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="zcg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,140 C100,130 150,100 250,70 C350,40 400,60 500,35 C600,10 650,25 750,12 C820,2 870,6 900,3 L900,150 L0,150 Z" fill="url(#zcg1)" />
              <path d="M0,140 C100,130 150,100 250,70 C350,40 400,60 500,35 C600,10 650,25 750,12 C820,2 870,6 900,3" fill="none" stroke="#6366f1" strokeWidth="2.5">
                <animate attributeName="stroke-dashoffset" from="900" to="0" dur="1.8s" fill="freeze" />
              </path>
              <path d="M0,130 C120,120 180,95 280,110 C380,125 420,70 520,55 C620,40 670,65 770,45 C840,30 880,38 900,28" fill="none" stroke="#8b5cf6" strokeWidth="1.8" opacity="0.55">
                <animate attributeName="stroke-dashoffset" from="900" to="0" dur="2.1s" begin="0.3s" fill="freeze" />
              </path>
            </svg>
          </div>

          {/* Bottom metric cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { ref: card1Ref, label: "Revenue",  value: "$127K", color: "#6366f1" },
              { ref: card2Ref, label: "Expenses", value: "$43K",  color: "#8b5cf6" },
              { ref: card3Ref, label: "Profit",   value: "$84K",  color: "#34d399" },
              { ref: card4Ref, label: "Margin",   value: "66%",   color: "#f59e0b" },
            ].map(({ ref, label, value, color }) => (
              <div key={label} ref={ref}
                className="rounded-xl p-4"
                style={{ background: `${color}0e`, border: `1px solid ${color}20`, willChange: "transform" }}>
                <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">{label}</div>
                <div className="text-2xl font-black" style={{ color }}>{value}</div>
                <div className="h-0.5 mt-2 rounded-full" style={{ background: `${color}30` }}>
                  <div className="h-full rounded-full transition-all" style={{ width: "66%", background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[10px] text-white/20 uppercase tracking-widest">Keep scrolling</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}
