"use client";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";

// ── Canvas texture factory ────────────────────────────────────────────────────
function buildCardCanvas(
  title: string, value: string,
  badge: string, badgeColor: string,
  accent: string, chart: number[]
): HTMLCanvasElement {
  const W = 640, H = 400;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;

  // Background
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 24);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "rgba(13,13,32,0.97)");
  bg.addColorStop(1, "rgba(5,5,14,0.99)");
  ctx.fillStyle = bg;
  ctx.fill();

  // Top glow line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(24, 1.5); ctx.lineTo(W - 24, 1.5);
  ctx.strokeStyle = accent; ctx.lineWidth = 2.5;
  ctx.shadowColor = accent; ctx.shadowBlur = 22;
  ctx.stroke(); ctx.restore();

  // Border
  ctx.beginPath();
  ctx.roundRect(1, 1, W - 2, H - 2, 24);
  ctx.strokeStyle = `${accent}30`; ctx.lineWidth = 1.5; ctx.stroke();

  // Title
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.font = "500 18px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(title.toUpperCase(), 30, 48);

  // Value
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 70px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.shadowColor = accent; ctx.shadowBlur = 26;
  ctx.fillText(value, 28, 144); ctx.restore();

  // Badge pill
  const bW = badge.length * 10 + 28;
  ctx.beginPath();
  ctx.roundRect(28, 158, bW, 28, 14);
  ctx.fillStyle = `${badgeColor}22`; ctx.fill();
  ctx.beginPath();
  ctx.roundRect(28, 158, bW, 28, 14);
  ctx.strokeStyle = `${badgeColor}50`; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = badgeColor;
  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(badge, 42, 177);

  // Bar chart
  const cX = 28, cY = 230, cH = 120, bars = chart.length;
  const bWd = Math.floor((W - 56) / bars) - 8;
  chart.forEach((v, i) => {
    const bh = v * cH;
    const bx = cX + i * (bWd + 8);
    const by = cY + cH - bh;
    const g = ctx.createLinearGradient(0, by, 0, cY + cH);
    g.addColorStop(0, accent); g.addColorStop(1, `${accent}08`);
    ctx.save();
    ctx.beginPath(); ctx.roundRect(bx, by, bWd, bh, 5);
    ctx.fillStyle = g; ctx.shadowColor = accent; ctx.shadowBlur = 10;
    ctx.fill(); ctx.restore();
  });

  return cv;
}

// ── Card definitions (plain objects, no THREE dependencies) ──────────────────
const CARDS = [
  {
    title: "Monthly Revenue", value: "$127K",
    badge: "↑ +24.5%", badgeColor: "#34d399", accent: "#6366f1",
    chart: [0.42, 0.58, 0.51, 0.73, 0.66, 0.88, 0.75],
    pos: [2.4, 0.2, 0] as [number, number, number],
    rot: [0.04, -0.18, 0.02] as [number, number, number],
  },
  {
    title: "Fuel Inventory", value: "87%",
    badge: "● 3 tanks live", badgeColor: "#818cf8", accent: "#8b5cf6",
    chart: [0.87, 0.83, 0.78, 0.85, 0.91, 0.87, 0.84],
    pos: [5.0, 1.8, -2.5] as [number, number, number],
    rot: [0.06, -0.35, 0.04] as [number, number, number],
  },
  {
    title: "Active Fleet", value: "24/26",
    badge: "2 in service", badgeColor: "#60a5fa", accent: "#3b82f6",
    chart: [0.9, 0.88, 0.92, 0.85, 0.93, 0.91, 0.88],
    pos: [-4.4, 1.4, -3.5] as [number, number, number],
    rot: [0.05, 0.38, -0.03] as [number, number, number],
  },
  {
    title: "Today's Trips", value: "148",
    badge: "12 in progress", badgeColor: "#f59e0b", accent: "#f59e0b",
    chart: [0.3, 0.5, 0.7, 0.62, 0.8, 0.9, 0.76],
    pos: [4.8, -2.2, -2] as [number, number, number],
    rot: [-0.05, -0.28, 0.03] as [number, number, number],
  },
  {
    title: "AI Insights", value: "3",
    badge: "⚡ Refill Tank B", badgeColor: "#a78bfa", accent: "#7c3aed",
    chart: [0.6, 0.4, 0.72, 0.55, 0.82, 0.64, 0.92],
    pos: [-4.2, -2.0, -4] as [number, number, number],
    rot: [-0.04, 0.32, -0.02] as [number, number, number],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function ThreeHero({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let cleanup: (() => void) | undefined;

    (() => {
      const W = mount.clientWidth, H = mount.clientHeight;

      // Scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
      camera.position.set(0, 0, 8);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // ── Particles ──
      const COUNT = 700;
      const pos = new Float32Array(COUNT * 3);
      const col = new Float32Array(COUNT * 3);
      const palette = [
        new THREE.Color("#6366f1"), new THREE.Color("#8b5cf6"),
        new THREE.Color("#a78bfa"), new THREE.Color("#60a5fa"),
        new THREE.Color("#c4b5fd"), new THREE.Color("#34d399"),
      ];
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 34;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 3;
        const c = palette[Math.floor(Math.random() * palette.length)];
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      pGeo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.055, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true,
      }));
      scene.add(particles);

      // ── Dashboard cards ──
      const cardMeshes: THREE.Mesh[] = [];
      CARDS.forEach((def) => {
        const cv = buildCardCanvas(def.title, def.value, def.badge, def.badgeColor, def.accent, def.chart);
        const tex = new THREE.CanvasTexture(cv);
        const geo = new THREE.PlaneGeometry(3.6, 2.25);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...def.pos);
        mesh.rotation.set(...def.rot);
        scene.add(mesh);
        cardMeshes.push(mesh);
      });

      // ── Orbital rings ──
      const rings: THREE.Mesh[] = [];
      [
        { r: 6.5, tube: 0.007, color: 0x6366f1, op: 0.14, rx: Math.PI / 3,   ry: 0 },
        { r: 9.0, tube: 0.005, color: 0x8b5cf6, op: 0.09, rx: Math.PI / 5,   ry: Math.PI / 4 },
        { r: 4.8, tube: 0.006, color: 0x60a5fa, op: 0.11, rx: Math.PI / 2.2, ry: Math.PI / 6 },
      ].forEach((d) => {
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(d.r, d.tube, 8, 120),
          new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.op })
        );
        mesh.rotation.set(d.rx, d.ry, 0);
        scene.add(mesh);
        rings.push(mesh);
      });

      // ── Mouse & scroll ──
      let tX = 0, tY = 0, cX = 0, cY = 0, scrollProg = 0;

      const onMouse = (e: MouseEvent) => {
        tX = (e.clientX / window.innerWidth  - 0.5) * 2;
        tY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      const onScroll = () => {
        const sec = sectionRef.current;
        if (!sec) return;
        const r = sec.getBoundingClientRect();
        scrollProg = Math.max(0, Math.min(1, -r.top / r.height));
      };
      const onResize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("mousemove", onMouse);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);

      // ── Render loop ──
      let animId: number, time = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        time += 0.010;

        cX += (tX - cX) * 0.036;
        cY += (tY - cY) * 0.036;

        const breathe = Math.sin(time * 0.18) * 0.12;
        camera.position.x = cX * 1.5 + breathe * 0.2;
        camera.position.y = cY * 0.9;
        camera.position.z = 8 - scrollProg * 6 + breathe;
        camera.lookAt(cX * 0.3, cY * 0.2, 0);

        cardMeshes.forEach((mesh, i) => {
          const def = CARDS[i];
          mesh.position.y = def.pos[1] + Math.sin(time * (0.24 + i * 0.055) + i * 1.4) * 0.13;
          const sign = def.pos[0] > 0 ? 1 : def.pos[0] < 0 ? -1 : 0;
          mesh.position.x = def.pos[0] + sign * scrollProg * 2.2;
          mesh.position.z = def.pos[2] - scrollProg * 2;
          mesh.rotation.y = def.rot[1] + cX * 0.13 + Math.sin(time * 0.28 + i) * 0.018;
          mesh.rotation.x = def.rot[0] + cY * 0.07;
        });

        rings.forEach((r, i) => {
          r.rotation.z = time * (0.10 + i * 0.04) * (i % 2 === 0 ? 1 : -1);
        });

        particles.rotation.y = time * 0.016 + cX * 0.05;
        particles.rotation.x = cY * 0.035;

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    })();

    return () => cleanup?.();
  }, [sectionRef]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}
