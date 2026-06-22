"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Play, Zap } from "lucide-react";
import { CursorFX } from "@/components/landing/cursor-fx";
import { MagneticButton } from "@/components/landing/magnetic-button";

const CinemaCanvas = dynamic(() => import("./cinema-canvas"), { ssr: false });

// ── Scramble Text ──────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#⚡◈◉●";
function ScrambleText({ text, delay = 600 }: { text: string; delay?: number }) {
  const [out, setOut] = useState(() => text.split("").map(() => " "));
  const fired = { v: false };
  useEffect(() => {
    const t = setTimeout(() => {
      if (fired.v) return; fired.v = true;
      let f = 0; const chars = text.split("");
      const id = setInterval(() => {
        f++;
        setOut(chars.map((ch, i) => {
          if (ch === " ") return " ";
          if (f > i * 4 + 12) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }));
        if (f >= chars.length * 4 + 20) clearInterval(id);
      }, 42);
    }, delay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{out.join("")}</>;
}

// ── Scroll progress (React state — only for HTML overlays) ────────────────
function useScroll() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let af: number;
    const tick = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
      af = requestAnimationFrame(tick);
    };
    af = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af);
  }, []);
  return p;
}

function fade(p: number, inStart: number, inEnd: number, outStart: number, outEnd: number) {
  const si = Math.max(0, Math.min(1, (p - inStart) / (inEnd - inStart)));
  const so = 1 - Math.max(0, Math.min(1, (p - outStart) / (outEnd - outStart)));
  return si * so;
}

// ── Text Overlay ────────────────────────────────────────────────────────────
function Overlay({
  tag, title, sub, op, left = "8vw", top = "50%",
}: {
  tag: string; title: string; sub: string; op: number; left?: string; top?: string;
}) {
  return (
    <div
      style={{
        position: "fixed", left, top,
        transform: "translateY(-50%)",
        opacity: op,
        transition: "opacity 0.6s ease",
        pointerEvents: op > 0.1 ? "auto" : "none",
        zIndex: 20,
        maxWidth: "min(520px, 48vw)",
      }}
    >
      <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.32em", color: "#8b5cf6", textTransform: "uppercase", marginBottom: "0.85rem" }}>
        {tag}
      </p>
      <h2 style={{ fontSize: "clamp(2rem, 4.2vw, 3.6rem)", fontWeight: 900, color: "#fff", lineHeight: 1.0, marginBottom: "1.1rem", textShadow: "0 0 40px rgba(99,102,241,0.35)" }}>
        {title}
      </h2>
      <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{sub}</p>
    </div>
  );
}

// ── Counter ─────────────────────────────────────────────────────────────────
function StatCount({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fff" }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

// ── NAV ─────────────────────────────────────────────────────────────────────
function CinemaNav() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.4rem 2.5rem",
      background: "linear-gradient(to bottom, rgba(5,5,12,0.9) 0%, transparent 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={14} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff", letterSpacing: "-0.02em" }}>FuelManager Pro</span>
      </div>
      <div style={{ display: "flex", gap: "2.2rem" }}>
        {["Features","Pricing","Docs"].map(l => (
          <a key={l} href="#" style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
            {l}
          </a>
        ))}
      </div>
      <Link href="/login" style={{
        fontSize: "0.82rem", fontWeight: 700, color: "#fff",
        background: "linear-gradient(135deg,#6366f1,#7c3aed)",
        padding: "0.52rem 1.35rem", borderRadius: 8, textDecoration: "none",
        boxShadow: "0 0 20px rgba(99,102,241,0.35)",
      }}>
        Sign in
      </Link>
    </nav>
  );
}

// ── MAIN PAGE ───────────────────────────────────────────────────────────────
export function CinemaPage() {
  const p = useScroll();

  // Lenis smooth scroll
  useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let id: number;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.3, smoothWheel: true,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      const raf = (t: number) => { lenis!.raf(t); id = requestAnimationFrame(raf); };
      id = requestAnimationFrame(raf);
    });
    return () => { lenis?.destroy(); cancelAnimationFrame(id); };
  }, []);

  // Hide OS cursor
  useEffect(() => {
    document.body.style.cursor = "none";
    return () => { document.body.style.cursor = ""; };
  }, []);

  // Scene opacity values
  const heroOp    = fade(p, 0,    0.04, 0.12, 0.18);
  const driveOp   = fade(p, 0.14, 0.22, 0.38, 0.44);
  const fuelOp    = fade(p, 0.40, 0.48, 0.58, 0.64);
  const dashOp    = fade(p, 0.62, 0.72, 0.86, 0.92);
  const ctaOp     = fade(p, 0.88, 0.95, 1.1,  1.2);

  return (
    <div style={{ background: "#050510", cursor: "none" }}>
      {/* Custom cursor */}
      <CursorFX />

      {/* Navigation */}
      <CinemaNav />

      {/* ── FULL-PAGE 3D CANVAS (fixed, behind everything) ── */}
      <CinemaCanvas />

      {/* ── SCROLL CONTAINER ── creates scroll depth for camera animation */}
      <div style={{ height: "700vh", position: "relative", zIndex: 1, pointerEvents: "none" }} />

      {/* ── HTML OVERLAYS ── */}

      {/* Scene 0: Hero */}
      <div style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none", opacity: heroOp, transition: "opacity 0.7s ease" }}>
        <div style={{ position: "absolute", left: "7vw", top: "50%", transform: "translateY(-50%)", maxWidth: "min(560px, 52vw)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", marginBottom: "1.5rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", display: "inline-block" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.25em", textTransform: "uppercase" }}>Now in Public Beta</span>
          </div>
          <h1 style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 900, color: "#fff", lineHeight: 0.95, marginBottom: "1.2rem", letterSpacing: "-0.03em" }}>
            Fuel Ops,{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block", fontFamily: "monospace" }}>
              <ScrambleText text="Reinvented." delay={800} />
            </span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.65, marginBottom: "2.2rem" }}>
            Enterprise fleet management, real-time fuel tracking, and AI-powered financial intelligence — all in one cinematic platform.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", pointerEvents: "auto" }}>
            <MagneticButton strength={0.3} radius={100}>
              <Link href="/register" style={{
                display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12,
                background: "linear-gradient(135deg,#6366f1,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: "0.88rem",
                textDecoration: "none", boxShadow: "0 0 36px rgba(99,102,241,0.5), 0 4px 20px rgba(0,0,0,0.4)",
              }}>
                Start for free <ArrowRight size={15} />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.25} radius={90}>
              <button style={{
                display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)",
                fontWeight: 600, fontSize: "0.88rem", cursor: "none",
              }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={10} fill="currentColor" />
                </span>
                Watch demo
              </button>
            </MagneticButton>
          </div>
          <div style={{ display: "flex", gap: 40, marginTop: 36 }}>
            <StatCount value="12K+" label="Fleet operators" />
            <StatCount value="$2.4B" label="Revenue tracked" />
            <StatCount value="99.9%" label="Uptime SLA" />
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.35em", textTransform: "uppercase" }}>Scroll to explore</span>
          <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }} />
        </div>
      </div>

      {/* Scene 1: Drive */}
      <Overlay
        op={driveOp}
        tag="Scene I — On the Road"
        title={"Real-time\nFleet Intelligence"}
        sub="Track every vehicle, fuel stop, and delivery in real time. Live GPS telemetry meets enterprise-grade analytics."
        left="7vw"
        top="50%"
      />

      {/* Scene 2: Fueling */}
      <Overlay
        op={fuelOp}
        tag="Scene II — Automated Fueling"
        title={"Zero-touch\nFuel Operations"}
        sub="Automated station integration, hose-level metering, and instant anomaly detection. Every drop accounted for."
        left="7vw"
        top="50%"
      />

      {/* Scene 3: Dashboard */}
      <Overlay
        op={dashOp}
        tag="Scene III — Live Analytics"
        title={"Your Data,\nBeautifully Clear"}
        sub="Revenue, efficiency, alerts, and fleet health — all assembled in 3D live dashboards that update in real time."
        left="7vw"
        top="50%"
      />

      {/* Scene 4: CTA */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: ctaOp, transition: "opacity 0.8s ease",
        pointerEvents: ctaOp > 0.1 ? "auto" : "none",
        background: ctaOp > 0.1 ? `rgba(5,5,16,${ctaOp * 0.7})` : "transparent",
      }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.3em", color: "#8b5cf6", textTransform: "uppercase", marginBottom: "1.2rem" }}>
          Scene IV — The Future of Fuel
        </p>
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.0, marginBottom: "1.4rem", maxWidth: 700 }}>
          Ready to run your fleet like a machine?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.1rem", textAlign: "center", marginBottom: "2.4rem", maxWidth: 480 }}>
          Join 12,000+ operators who have already reinvented their fuel operations.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <MagneticButton strength={0.35} radius={110}>
            <Link href="/register" style={{
              padding: "16px 36px", borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#7c3aed)",
              color: "#fff", fontWeight: 800, fontSize: "1rem", textDecoration: "none",
              boxShadow: "0 0 50px rgba(99,102,241,0.6), 0 8px 30px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              Get started for free <ArrowRight size={18} />
            </Link>
          </MagneticButton>
          <MagneticButton strength={0.25} radius={90}>
            <Link href="/login" style={{
              padding: "16px 28px", borderRadius: 14, background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.7)",
              fontWeight: 600, fontSize: "1rem", textDecoration: "none",
            }}>
              Sign in
            </Link>
          </MagneticButton>
        </div>
        <div style={{ display: "flex", gap: 48, marginTop: 52 }}>
          {[["12K+","Fleet operators"],["$2.4B","Revenue tracked"],["99.9%","Uptime SLA"],["0","Fuel leaks missed"]].map(([v,l]) => (
            <StatCount key={l} value={v} label={l} />
          ))}
        </div>
      </div>
    </div>
  );
}
