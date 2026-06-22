"use client";
import { useEffect } from "react";
import { CursorFX }       from "./cursor-fx";
import { LandingNav }     from "./nav";
import { Hero }           from "./hero";
import { SceneZoom }      from "./scene-zoom";
import { SceneExplode }   from "./scene-explode";
import { FuelScene }      from "./fuel-scene";
import { AISection }      from "./ai-section";
import { Pricing }        from "./pricing";
import { Testimonials }   from "./testimonials";
import { Footer }         from "./footer";

export function LandingPage() {
  // Hide OS cursor for the custom fuel-drop cursor
  useEffect(() => {
    document.body.style.cursor = "none";
    return () => { document.body.style.cursor = ""; };
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let animId: number;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.25, smoothWheel: true,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      const raf = (t: number) => { lenis!.raf(t); animId = requestAnimationFrame(raf); };
      animId = requestAnimationFrame(raf);
    });
    return () => { lenis?.destroy(); cancelAnimationFrame(animId); };
  }, []);

  // GSAP ScrollTrigger global data-parallax
  useEffect(() => {
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach(el => {
          const speed = parseFloat(el.dataset.parallax || "0.3");
          gsap.to(el, {
            yPercent: speed * 100, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
        return () => ScrollTrigger.getAll().forEach(t => t.kill());
      }
    );
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#0a0a0f", cursor: "none" }}>
      {/* Global custom cursor */}
      <CursorFX />

      {/* ── Navigation ── */}
      <LandingNav />

      {/* ── Scene 0: Hero (Three.js 3D + scramble text + magnetic CTAs) ── */}
      <Hero />

      {/* ── Scene I: Dashboard zoom (GSAP pinned, perspective zoom) ── */}
      <SceneZoom />

      {/* ── Scene II: Feature explosion (GSAP pinned, cards fly + reconnect) ── */}
      <SceneExplode />

      {/* ── Scene III: Live fuel gauge (scroll-driven liquid fill + mouse ripple) ── */}
      <FuelScene />

      {/* ── AI Intelligence section ── */}
      <AISection />

      {/* ── Pricing (depth emergence) ── */}
      <Pricing />

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
