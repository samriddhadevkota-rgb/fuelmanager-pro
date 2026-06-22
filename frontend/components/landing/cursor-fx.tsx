"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  size: number;
  color: string;
  type: "spark" | "drop" | "ring";
  radius?: number;
}

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#60a5fa", "#34d399", "#c4b5fd"];

export function CursorFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const particles: Particle[] = [];
    let animId: number;
    let mx = -300, my = -300;
    let lx = -300, ly = -300;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;

      const dx = mx - lx, dy = my - ly;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const count = Math.min(Math.floor(speed / 6) + 1, 6);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const s = 0.4 + Math.random() * 2;
        particles.push({
          x: mx, y: my,
          vx: Math.cos(angle) * s + dx * 0.04,
          vy: Math.sin(angle) * s + dy * 0.04,
          life: 1, size: 1.5 + Math.random() * 3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          type: "spark",
        });
      }

      // Occasional fuel drop
      if (Math.random() < 0.1) {
        particles.push({
          x: mx, y: my,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1.5 + Math.random() * 3,
          life: 1, size: 4 + Math.random() * 5,
          color: "#6366f1",
          type: "drop",
        });
      }

      lx = mx; ly = my;
    };

    const onClick = (e: MouseEvent) => {
      const cx = e.clientX, cy = e.clientY;

      // Burst
      for (let i = 0; i < 55; i++) {
        const angle = (i / 55) * Math.PI * 2 + Math.random() * 0.15;
        const speed = 3 + Math.random() * 11;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, size: 3 + Math.random() * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          type: i < 12 ? "drop" : "spark",
        });
      }

      // Expanding ring ×2
      for (let r = 0; r < 2; r++) {
        particles.push({
          x: cx, y: cy, vx: 0, vy: 0,
          life: 1, size: 0,
          color: r === 0 ? "#6366f1" : "#a78bfa",
          type: "ring", radius: r * 10,
        });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    function drawCursor(x: number, y: number, t: number) {
      ctx.save();
      ctx.translate(x, y);

      // Pulsing outer glow
      const pulse = 0.75 + 0.25 * Math.sin(t * 3.5);
      const r = 24 * pulse;
      const glow = ctx.createRadialGradient(0, 2, 0, 0, 2, r);
      glow.addColorStop(0, `rgba(99,102,241,${0.45 * pulse})`);
      glow.addColorStop(0.5, `rgba(139,92,246,${0.2 * pulse})`);
      glow.addColorStop(1, "rgba(99,102,241,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 2, r, 0, Math.PI * 2);
      ctx.fill();

      // Fuel drop body (teardrop)
      ctx.shadowColor = "#a78bfa";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "rgba(167,139,250,0.92)";
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.bezierCurveTo(8, -3.5, 8, 4.5, 0, 10);
      ctx.bezierCurveTo(-8, 4.5, -8, -3.5, 0, -11);
      ctx.closePath();
      ctx.fill();

      // Inner specular highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(-2.2, -3.5, 1.8, 3.8, -0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.type === "ring") {
          p.radius = (p.radius ?? 0) + 5;
          p.life -= 0.035;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = p.life * 0.7;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.type === "spark") { p.vy += 0.06; p.vx *= 0.98; }
        if (p.type === "drop") { p.vy += 0.18; p.vx *= 0.97; }
        p.life -= p.type === "drop" ? 0.016 : 0.028;
        p.size *= 0.967;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = Math.pow(p.life, 1.4);

        if (p.type === "drop") {
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.7, -s * 0.3, s * 0.7, s * 0.4, 0, s * 0.9);
          ctx.bezierCurveTo(-s * 0.7, s * 0.4, -s * 0.7, -s * 0.3, 0, -s);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (mx > -200) drawCursor(mx, my, time);
      animId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 99999, mixBlendMode: "screen" }}
    />
  );
}
