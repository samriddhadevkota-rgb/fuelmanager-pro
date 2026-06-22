"use client";
import { useEffect, useRef } from "react";
import { Fuel, BarChart3, Truck, FileText, Users, Zap } from "lucide-react";

const FEATURES = [
  { icon: Fuel,      label: "Fuel Inventory",     sub: "Real-time tank levels",   color: "#6366f1", tx:    0, ty: -260 },
  { icon: BarChart3, label: "Revenue Intel",       sub: "AI-powered forecasts",    color: "#8b5cf6", tx:  280, ty: -140 },
  { icon: Truck,     label: "Fleet Tracking",      sub: "GPS + telematics",        color: "#3b82f6", tx:  280, ty:  140 },
  { icon: FileText,  label: "Smart Invoicing",     sub: "Auto-generate & send",    color: "#34d399", tx:    0, ty:  260 },
  { icon: Users,     label: "Driver Management",   sub: "Compliance + payroll",    color: "#f59e0b", tx: -280, ty:  140 },
  { icon: Zap,       label: "AI Insights",         sub: "Anomaly & theft alerts",  color: "#ec4899", tx: -280, ty: -140 },
];

export function SceneExplode() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const cardsRef    = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const centerRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killFn: (() => void) | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);

        const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

        // Initial state: all stacked at center, invisible
        gsap.set(cards, {
          xPercent: -50, yPercent: -50,
          x: 0, y: 0,
          opacity: 0, scale: 0.5,
          rotateY: 0, rotateZ: 0,
        });

        // Canvas line drawing on scroll update
        const drawLines = (progress: number) => {
          const canvas = canvasRef.current;
          const section = sectionRef.current;
          if (!canvas || !section) return;

          const sr = section.getBoundingClientRect();
          canvas.width  = sr.width;
          canvas.height = sr.height;

          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (progress < 0.55) return;
          const lineOpacity = Math.min(1, (progress - 0.55) / 0.2);

          const cx = canvas.width / 2;
          const cy = canvas.height / 2;

          cards.forEach((card, i) => {
            if (!card) return;
            const cr  = card.getBoundingClientRect();
            const ecx = cr.left - sr.left + cr.width  / 2;
            const ecy = cr.top  - sr.top  + cr.height / 2;
            const color = FEATURES[i].color;

            const grad = ctx.createLinearGradient(cx, cy, ecx, ecy);
            grad.addColorStop(0, `${color}90`);
            grad.addColorStop(1, `${color}20`);

            ctx.save();
            ctx.globalAlpha = lineOpacity;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(ecx, ecy);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = color;
            ctx.shadowBlur  = 10;
            ctx.stroke();
            ctx.restore();

            // Glow dot at card end
            ctx.save();
            ctx.globalAlpha = lineOpacity * 0.9;
            ctx.beginPath();
            ctx.arc(ecx, ecy, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur  = 12;
            ctx.fill();
            ctx.restore();
          });

          // Center dot
          ctx.save();
          ctx.globalAlpha = lineOpacity;
          const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
          cg.addColorStop(0, "rgba(99,102,241,0.9)");
          cg.addColorStop(1, "rgba(99,102,241,0)");
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=320%",
            scrub: 1.4,
            pin: true,
            onUpdate: (self) => drawLines(self.progress),
          },
        });

        // Phase 1 (0 → 0.2): Cards appear stacked
        tl.to(cards, {
          opacity: 1, scale: 1,
          stagger: 0.025,
          ease: "back.out(2)",
          duration: 0.2,
        }, 0);

        // Phase 2 (0.2 → 0.58): EXPLOSION to hex positions
        FEATURES.forEach((f, i) => {
          tl.to(cards[i], {
            x: f.tx, y: f.ty,
            rotateZ: (i % 2 === 0 ? 1 : -1) * (4 + i * 1.5),
            rotateY: (i % 2 === 0 ? 8 : -8),
            scale: 1,
            ease: "expo.out",
            duration: 0.38,
          }, 0.2 + i * 0.018);
        });

        // Phase 3 (0.58 → 0.78): Cards settle upright + labels solidify
        tl.to(cards, {
          rotateZ: 0, rotateY: 0,
          ease: "elastic.out(1, 0.6)",
          duration: 0.25,
        }, 0.58);

        tl.fromTo(".explode-label", {
          opacity: 0, y: 8,
        }, {
          opacity: 1, y: 0,
          stagger: 0.04,
          ease: "power2.out",
          duration: 0.2,
        }, 0.62);

        // Phase 4 (0.85 → 1.0): Slight float in place
        cards.forEach((card, i) => {
          tl.to(card, {
            y: FEATURES[i].ty + (i % 2 === 0 ? -8 : 8),
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
            duration: 0.1,
          }, 0.87 + i * 0.01);
        });

        killFn = () => ScrollTrigger.getAll().forEach(t => t.kill());
      }
    );

    return () => killFn?.();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#050510" }}>

      {/* Dynamic bg shift */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)" }} />

      {/* Canvas overlay for connection lines */}
      <canvas ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 5 }} />

      {/* Label */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
        <p className="text-[11px] font-bold text-violet-400 uppercase tracking-[0.3em] mb-2">Scene II — Feature Explosion</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white">Everything. <span className="landing-gradient-text">Connected.</span></h2>
      </div>

      {/* Center anchor — cards GSAP relative to this */}
      <div ref={centerRef} className="relative z-10" style={{ width: 0, height: 0 }}>
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.label}
              ref={el => { cardsRef.current[i] = el; }}
              className="absolute w-48 glass-landing rounded-2xl p-5"
              style={{
                border: `1px solid ${f.color}28`,
                boxShadow: `0 0 40px ${f.color}12, 0 8px 32px rgba(0,0,0,0.5)`,
                willChange: "transform",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                <Icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <div className="explode-label">
                <div className="text-sm font-bold text-white leading-tight">{f.label}</div>
                <div className="text-[11px] text-white/35 mt-0.5">{f.sub}</div>
              </div>
              {/* Glow accent bar */}
              <div className="h-0.5 mt-3 rounded-full" style={{ background: `${f.color}40` }} />
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[10px] text-white/20 uppercase tracking-widest">Keep scrolling</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}
