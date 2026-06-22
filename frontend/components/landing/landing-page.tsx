"use client";
import { useEffect } from "react";
import { LandingNav } from "./nav";
import { Hero } from "./hero";
import { Features } from "./features";
import { FuelScene } from "./fuel-scene";
import { DashboardShowcase } from "./dashboard-showcase";
import { AISection } from "./ai-section";
import { Pricing } from "./pricing";
import { Testimonials } from "./testimonials";
import { Footer } from "./footer";
import { CursorFX } from "./cursor-fx";

export function LandingPage() {
  useEffect(() => {
    // Hide default cursor on the landing page
    document.body.style.cursor = "none";
    return () => { document.body.style.cursor = ""; };
  }, []);

  useEffect(() => {
    // Lenis smooth scroll
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let animId: number;

    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.3,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis!.raf(time);
        animId = requestAnimationFrame(raf);
      }
      animId = requestAnimationFrame(raf);
    });

    return () => {
      lenis?.destroy();
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach(el => {
        const speed = parseFloat(el.dataset.parallax || "0.3");
        gsap.to(el, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#0a0a0f", cursor: "none" }}>
      {/* Custom cursor — rendered outside scroll container so it's always on top */}
      <CursorFX />
      <LandingNav />
      <Hero />
      <Features />
      <FuelScene />
      <DashboardShowcase />
      <AISection />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}
