"use client";
import { useRef, useMemo, useEffect, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, PerformanceMonitor, AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// MATH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function ss(min: number, max: number, v: number) {
  const x = Math.max(0, Math.min(1, (v - min) / (max - min)));
  return x * x * (3 - 2 * x);
}
function lp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS TEXTURE BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildCardTex(title: string, value: string, sub: string, color: string) {
  const W = 640, H = 380;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;

  // BG
  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d0d1e"); bg.addColorStop(1, "#07070f");
  c.fillStyle = bg;
  c.beginPath(); c.roundRect(0, 0, W, H, 24); c.fill();

  // Border glow
  c.strokeStyle = color + "55"; c.lineWidth = 2;
  c.beginPath(); c.roundRect(1, 1, W - 2, H - 2, 23); c.stroke();

  // Accent pill
  const pill = c.createLinearGradient(28, 28, 90, 40);
  pill.addColorStop(0, color); pill.addColorStop(1, color + "80");
  c.fillStyle = pill;
  c.beginPath(); c.roundRect(28, 28, 60, 6, 3); c.fill();

  // Title
  c.fillStyle = "rgba(255,255,255,0.45)"; c.font = "500 24px system-ui,sans-serif";
  c.fillText(title, 28, 84);

  // Value
  c.fillStyle = "#fff"; c.font = "800 72px system-ui,sans-serif";
  c.fillText(value, 28, 170);

  // Sub
  c.fillStyle = color; c.font = "600 22px system-ui,sans-serif";
  c.fillText(sub, 28, 212);

  // Mini bar chart
  const bars = [38, 62, 44, 78, 52, 90, 68, 82];
  bars.forEach((h, i) => {
    const bh = (h / 100) * 80, bx = 28 + i * 74, by = H - 34 - bh;
    const g = c.createLinearGradient(bx, by + bh, bx, by);
    g.addColorStop(0, color + "18"); g.addColorStop(1, color + "cc");
    c.fillStyle = g;
    c.beginPath(); c.roundRect(bx, by, 62, bh, 4); c.fill();
  });

  // Glow shadow at top
  c.shadowColor = color; c.shadowBlur = 30;
  c.fillStyle = color + "08";
  c.beginPath(); c.roundRect(0, 0, W, 100, 24); c.fill();
  c.shadowBlur = 0;

  return new THREE.CanvasTexture(cv);
}

// ─────────────────────────────────────────────────────────────────────────────
// THE FUEL TRUCK (procedural, ~25 meshes, PBR)
// ─────────────────────────────────────────────────────────────────────────────
function FuelTruck({ scrollRef }: { scrollRef: RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);

  const m = useMemo(() => ({
    cab:    new THREE.MeshStandardMaterial({ color: "#111126", metalness: 0.45, roughness: 0.55, transparent: true }),
    tank:   new THREE.MeshStandardMaterial({ color: "#c2c2d0", metalness: 0.78, roughness: 0.2,  transparent: true }),
    chrome: new THREE.MeshStandardMaterial({ color: "#aaaacc", metalness: 0.95, roughness: 0.05, transparent: true }),
    tire:   new THREE.MeshStandardMaterial({ color: "#0c0c0c", metalness: 0,    roughness: 0.95, transparent: true }),
    glass:  new THREE.MeshStandardMaterial({ color: "#002233", metalness: 0.1,  roughness: 0.05, transparent: true, opacity: 0.65 }),
    head:   new THREE.MeshStandardMaterial({ color: "#fff8e0", emissive: new THREE.Color("#ffcc44"), emissiveIntensity: 8, transparent: true }),
    tail:   new THREE.MeshStandardMaterial({ color: "#110000", emissive: new THREE.Color("#ff1500"), emissiveIntensity: 4, transparent: true }),
    dark:   new THREE.MeshStandardMaterial({ color: "#09091a", metalness: 0.55, roughness: 0.5,  transparent: true }),
  }), []);

  useEffect(() => () => { Object.values(m).forEach(mat => mat.dispose()); }, [m]);

  useFrame(({ clock }) => {
    const p = scrollRef.current;
    if (!g.current) return;
    const t = clock.getElapsedTime();

    // Drive: z goes 12 → -13 between scroll 0.15-0.42
    const dT = ss(0.15, 0.42, p);
    g.current.position.z = lp(12, -13, dT);

    // Chassis bounce during drive
    const bounce = Math.max(0, Math.min(1, 4 * dT * (1 - dT)));
    g.current.position.y = Math.sin(t * 14) * bounce * 0.04;

    // Wheel spin
    const spinning = dT > 0.03 && dT < 0.97;
    wheels.current.forEach(w => { if (w && spinning) w.rotation.x -= 0.12; });

    // Fade out when dashboard appears
    const fade = Math.max(0, 1 - ss(0.60, 0.72, p));
    Object.values(m).forEach(mat => { mat.opacity = mat === m.glass ? fade * 0.65 : fade; });
    g.current.visible = fade > 0.01;
  });

  const WP: [number, number, number][] = [
    [-2.5, 0.52, -1.45], [-2.5, 0.52, 1.45],
    [0.9,  0.52, -1.45], [0.9,  0.52, 1.45],
    [2.3,  0.52, -1.52], [2.3,  0.52, 1.52],
    [2.3,  0.52, -0.96], [2.3,  0.52, 0.96],
  ];

  const Wheel = ({ pos, idx }: { pos: [number, number, number], idx: number }) => (
    <group position={pos}>
      <mesh ref={el => { if (el) wheels.current[idx] = el; }} rotation={[0, 0, Math.PI / 2]} material={m.tire} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.44, 20]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={m.chrome}>
        <cylinderGeometry args={[0.3, 0.3, 0.46, 8]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={m.dark}>
        <cylinderGeometry args={[0.535, 0.535, 0.12, 20]} />
      </mesh>
    </group>
  );

  return (
    <group ref={g}>
      {/* ── CAB ── */}
      <mesh position={[-2.2, 1.76, 0]} material={m.cab} castShadow receiveShadow>
        <boxGeometry args={[2.85, 3.02, 2.68]} />
      </mesh>
      <mesh position={[-1.65, 3.38, 0]} rotation={[0.1, 0, 0]} material={m.cab} castShadow>
        <boxGeometry args={[2.15, 0.74, 2.78]} />
      </mesh>
      <mesh position={[-3.72, 0.56, 0]} material={m.dark}>
        <boxGeometry args={[0.36, 0.88, 2.72]} />
      </mesh>
      <mesh position={[-3.64, 1.64, 0]} material={m.dark}>
        <boxGeometry args={[0.2, 1.92, 2.22]} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-0.99, 2.1, 0]} material={m.glass}>
        <boxGeometry args={[0.09, 1.3, 2.2]} />
      </mesh>
      {/* Side windows */}
      {([-1, 1] as const).map((z, i) => (
        <mesh key={i} position={[-2.1, 2.14, z * 1.35]} material={m.glass}>
          <boxGeometry args={[1.82, 1.12, 0.07]} />
        </mesh>
      ))}
      {/* Headlights */}
      {([-1, 1] as const).map((z, i) => (
        <group key={i} position={[-3.66, 1.62, z * 0.9]}>
          <mesh material={m.head}>
            <boxGeometry args={[0.12, 0.36, 0.62]} />
          </mesh>
          <pointLight color="#ffcc44" intensity={50} distance={16} decay={2} position={[-0.4, 0, 0]} />
          <pointLight color="#ffe88a" intensity={15} distance={8} decay={2} position={[-0.4, -0.8, z * 0.5]} />
        </group>
      ))}
      {/* Tail lights */}
      {([-1, 1] as const).map((z, i) => (
        <group key={i} position={[4.62, 1.28, z * 0.88]}>
          <mesh material={m.tail}>
            <boxGeometry args={[0.1, 0.28, 0.46]} />
          </mesh>
          <pointLight color="#ff1100" intensity={6} distance={4} decay={2} />
        </group>
      ))}
      {/* Exhaust */}
      {([-1, 1] as const).map((z, i) => (
        <mesh key={i} position={[-1.58, 3.0, z * 0.88]} material={m.chrome}>
          <cylinderGeometry args={[0.065, 0.072, 1.6, 10]} />
        </mesh>
      ))}
      {/* Mirrors */}
      {([-1, 1] as const).map((z, i) => (
        <mesh key={i} position={[-0.68, 2.78, z * 1.44]} material={m.dark}>
          <boxGeometry args={[0.32, 0.24, 0.08]} />
        </mesh>
      ))}
      {/* Steps */}
      {([-1, 1] as const).map((z, i) => (
        <mesh key={i} position={[-3.55, 0.52, z * 0.88]} material={m.chrome}>
          <boxGeometry args={[0.55, 0.1, 0.46]} />
        </mesh>
      ))}

      {/* ── CHASSIS ── */}
      <mesh position={[0, 0.38, 0]} material={m.dark}>
        <boxGeometry args={[8.9, 0.28, 0.84]} />
      </mesh>

      {/* ── FUEL TANK ── */}
      {([-1, 1] as const).map((ox, i) => (
        <mesh key={i} position={[ox * 1.1 + 1.7, 1.1, 0]} material={m.dark}>
          <boxGeometry args={[0.28, 0.62, 2.38]} />
        </mesh>
      ))}
      <mesh position={[1.85, 1.74, 0]} rotation={[0, 0, Math.PI / 2]} material={m.tank} castShadow>
        <cylinderGeometry args={[0.92, 0.92, 5.6, 30]} />
      </mesh>
      {/* Caps */}
      <mesh position={[-0.94, 1.74, 0]} rotation={[0, 0, Math.PI / 2]} material={m.tank}>
        <sphereGeometry args={[0.92, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[4.64, 1.74, 0]} rotation={[0, 0, -Math.PI / 2]} material={m.tank}>
        <sphereGeometry args={[0.92, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Banding */}
      {([-1.8, -0.3, 1.2, 2.7] as const).map((ox, i) => (
        <mesh key={i} position={[ox + 1.5, 1.74, 0]} rotation={[0, 0, Math.PI / 2]} material={m.chrome}>
          <cylinderGeometry args={[0.94, 0.94, 0.1, 24]} />
        </mesh>
      ))}
      {/* Catwalk */}
      <mesh position={[1.85, 2.74, 0]} material={m.dark}>
        <boxGeometry args={[5.2, 0.07, 0.56]} />
      </mesh>
      {/* Ladder */}
      <mesh position={[4.52, 1.62, 0.96]} material={m.chrome}>
        <boxGeometry args={[0.06, 2.32, 0.06]} />
      </mesh>
      {[0.36, 0.76, 1.16, 1.56].map((hy, i) => (
        <mesh key={i} position={[4.52, hy, 0.96]} material={m.chrome}>
          <boxGeometry args={[0.06, 0.06, 0.62]} />
        </mesh>
      ))}

      {/* ── WHEELS ── */}
      {WP.map((pos, i) => <Wheel key={i} pos={pos} idx={i} />)}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FUEL STATION
// ─────────────────────────────────────────────────────────────────────────────
function FuelStation({ scrollRef }: { scrollRef: RefObject<number> }) {
  const g = useRef<THREE.Group>(null);

  const m = useMemo(() => ({
    pad:    new THREE.MeshStandardMaterial({ color: "#151525", roughness: 0.9,  metalness: 0.15, transparent: true }),
    frame:  new THREE.MeshStandardMaterial({ color: "#0d0d1f", roughness: 0.45, metalness: 0.6,  transparent: true }),
    pump:   new THREE.MeshStandardMaterial({ color: "#12121e", roughness: 0.5,  metalness: 0.5,  transparent: true }),
    screen: new THREE.MeshStandardMaterial({ color: "#fff", emissive: new THREE.Color("#6366f1"), emissiveIntensity: 4, transparent: true }),
    hose:   new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.85, metalness: 0.2,  transparent: true }),
    glow:   new THREE.MeshStandardMaterial({ color: "#fff", emissive: new THREE.Color("#4338ca"), emissiveIntensity: 5, transparent: true }),
    stripe: new THREE.MeshStandardMaterial({ color: "#fff", emissive: new THREE.Color("#6366f1"), emissiveIntensity: 2, transparent: true }),
  }), []);

  useEffect(() => () => { Object.values(m).forEach(mat => mat.dispose()); }, [m]);

  useFrame(() => {
    const p = scrollRef.current;
    if (!g.current) return;

    const fadeIn  = ss(0.28, 0.38, p);
    const fadeOut = 1 - ss(0.62, 0.72, p);
    const op = fadeIn * fadeOut;
    Object.values(m).forEach(mat => { mat.opacity = op; });
    g.current.visible = op > 0.01;
  });

  return (
    <group ref={g} position={[0, 0, -18]}>
      {/* Concrete pad */}
      <mesh position={[0, 0.12, 0]} material={m.pad} receiveShadow>
        <boxGeometry args={[10, 0.25, 6]} />
      </mesh>
      {/* Canopy columns */}
      {([-3.8, 3.8] as const).map((x, i) => (
        <mesh key={i} position={[x, 2.7, 0]} material={m.frame}>
          <cylinderGeometry args={[0.2, 0.2, 5.4, 10]} />
        </mesh>
      ))}
      {/* Canopy roof */}
      <mesh position={[0, 5.35, 0]} material={m.frame}>
        <boxGeometry args={[9.2, 0.28, 7]} />
      </mesh>
      {/* Canopy glow strip */}
      <mesh position={[0, 5.21, 0]} material={m.glow}>
        <boxGeometry args={[8.6, 0.05, 0.45]} />
      </mesh>
      <pointLight position={[0, 4.9, 0]} color="#6366f1" intensity={30} distance={10} decay={2} />
      <pointLight position={[-3, 4.9, 0]} color="#4338ca" intensity={15} distance={6} decay={2} />
      <pointLight position={[ 3, 4.9, 0]} color="#4338ca" intensity={15} distance={6} decay={2} />
      {/* Pumps */}
      {([-2.5, 0, 2.5] as const).map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 1.3, 0]} material={m.pump}>
            <boxGeometry args={[0.82, 2.6, 0.58]} />
          </mesh>
          <mesh position={[0.42, 1.58, 0]} material={m.screen}>
            <boxGeometry args={[0.05, 0.62, 0.42]} />
          </mesh>
          {/* Pump side stripe */}
          <mesh position={[0.42, 0.9, 0]} material={m.stripe}>
            <boxGeometry args={[0.05, 0.15, 0.58]} />
          </mesh>
          <pointLight color="#6366f1" intensity={10} distance={4} decay={2} position={[0.6, 1.6, 0]} />
        </group>
      ))}
      {/* Fuel hose from pump 0 to truck side */}
      <mesh position={[0.4, 0.85, 1.8]} rotation={[Math.PI * 0.35, 0, 0]} material={m.hose}>
        <cylinderGeometry args={[0.055, 0.055, 3.6, 8]} />
      </mesh>
      {/* Nozzle end */}
      <mesh position={[0.4, -0.22, 3.3]} material={m.hose}>
        <cylinderGeometry args={[0.08, 0.055, 0.22, 8]} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FUEL PARTICLE STREAM
// ─────────────────────────────────────────────────────────────────────────────
function FuelParticles({ scrollRef }: { scrollRef: RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => Array.from({ length: 80 }, () => ({
    offset: Math.random(),
    xr: (Math.random() - 0.5) * 0.18,
    zr: (Math.random() - 0.5) * 0.18,
  })), []);

  useFrame(({ clock }) => {
    const p = scrollRef.current;
    const m = mesh.current;
    if (!m) return;

    // Visible only during fueling (0.42-0.62)
    const vis = ss(0.42, 0.48, p) * (1 - ss(0.58, 0.65, p));
    m.visible = vis > 0.01;
    if (!vis) return;

    const t = clock.getElapsedTime();
    data.forEach((d, i) => {
      const cy = ((d.offset + t * 1.4) % 1); // 0-1 fall progress
      dummy.position.set(
        0.4 + d.xr,
        0.8 - cy * 1.4,
        -15 + d.zr
      );
      dummy.scale.setScalar(lp(0.06, 0.02, cy));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 80]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={2}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENERGY PARTICLES (atmospheric GPU particles)
// ─────────────────────────────────────────────────────────────────────────────
function EnergyParticles({ scrollRef: _scrollRef }: { scrollRef: RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const COUNT = 1200;

  const data = useMemo(() => Array.from({ length: COUNT }, () => ({
    x: (Math.random() - 0.5) * 70,
    y: Math.random() * 24 - 4,
    z: (Math.random() - 0.5) * 70,
    spd: 0.15 + Math.random() * 0.35,
    off: Math.random() * Math.PI * 2,
    sc:  0.04 + Math.random() * 0.06,
    color: Math.floor(Math.random() * 4),
  })), []);

  const colorMats = useMemo(() => ["#6366f1","#8b5cf6","#60a5fa","#34d399"].map(c => new THREE.MeshStandardMaterial({
    color: c, emissive: new THREE.Color(c), emissiveIntensity: 0.8, transparent: true, opacity: 0.7,
  })), []);

  useEffect(() => () => { colorMats.forEach(m => m.dispose()); }, [colorMats]);

  // Use 4 separate instanced meshes (one per color)
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([]);
  const subData = useMemo(() => {
    const buckets: typeof data[] = [[],[],[],[]];
    data.forEach(d => buckets[d.color].push(d));
    return buckets;
  }, [data]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshes.current.forEach((m, ci) => {
      if (!m) return;
      subData[ci].forEach((d, i) => {
        dummy.position.set(d.x, d.y + Math.sin(t * d.spd + d.off) * 0.6, d.z);
        dummy.scale.setScalar(d.sc);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    });
  });

  const geo = useMemo(() => new THREE.SphereGeometry(1, 4, 4), []);
  useEffect(() => () => { geo.dispose(); }, [geo]);

  return (
    <>
      {colorMats.map((mat, ci) => (
        <instancedMesh
          key={ci}
          ref={el => { meshes.current[ci] = el; }}
          args={[geo, mat, subData[ci].length]}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD CARDS 3D
// ─────────────────────────────────────────────────────────────────────────────
const CARDS = [
  { title: "Revenue Today",  value: "$284K",  sub: "+12.4% vs yesterday", color: "#6366f1", pos: [-4.5, 6.5, -3.5] as [number,number,number], ry: 0.16  },
  { title: "Fuel Dispensed", value: "94.2K L", sub: "liters this week",  color: "#8b5cf6", pos: [ 4.5, 6.5, -3.5] as [number,number,number], ry: -0.16 },
  { title: "Fleet Active",   value: "1,247",  sub: "vehicles online",    color: "#3b82f6", pos: [  0,  9.0, -2.5] as [number,number,number], ry: 0     },
  { title: "Avg Efficiency", value: "8.9km/L", sub: "per liter, +2.1%", color: "#10b981", pos: [-4.2, 4.2, -5.5] as [number,number,number], ry: 0.22  },
  { title: "Cost Saved",     value: "$43K",   sub: "AI optimization",    color: "#f59e0b", pos: [ 4.2, 4.2, -5.5] as [number,number,number], ry: -0.22 },
  { title: "Alerts",         value: "0",      sub: "All systems normal", color: "#34d399", pos: [  0,  5.8, -8.0] as [number,number,number], ry: 0     },
];

function DashboardCards3D({ scrollRef }: { scrollRef: RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lineRef = useRef<THREE.LineSegments>(null);

  const textures = useMemo(() => CARDS.map(d => buildCardTex(d.title, d.value, d.sub, d.color)), []);

  const mats = useMemo(() => textures.map((tex, i) => {
    const m = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, opacity: 0,
      emissive: new THREE.Color(CARDS[i].color),
      emissiveIntensity: 0.06,
      side: THREE.DoubleSide,
    });
    return m;
  }), [textures]);

  // Connection lines geometry
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const center = [0, 6.5, -4.5];
    const pos = new Float32Array(CARDS.length * 6);
    CARDS.forEach((d, i) => {
      pos[i * 6 + 0] = center[0]; pos[i * 6 + 1] = center[1]; pos[i * 6 + 2] = center[2];
      pos[i * 6 + 3] = d.pos[0]; pos[i * 6 + 4] = d.pos[1]; pos[i * 6 + 5] = d.pos[2];
    });
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: "#6366f1", transparent: true, opacity: 0,
  }), []);

  useEffect(() => () => {
    textures.forEach(t => t.dispose());
    mats.forEach(m => m.dispose());
    lineGeo.dispose(); lineMat.dispose();
  }, [textures, mats, lineGeo, lineMat]);

  useFrame(({ clock }) => {
    const p = scrollRef.current;
    const t = clock.getElapsedTime();

    const appear = ss(0.60, 0.76, p);

    mats.forEach((mat, i) => {
      // Staggered by card index
      const staggerP = Math.max(0, Math.min(1, appear * 6 - i * 0.6));
      mat.opacity = staggerP;
    });

    lineMat.opacity = appear * 0.5;

    // Float each card individually
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const base = CARDS[i].pos;
      mesh.position.y = base[1] + Math.sin(t * 0.55 + i * 1.1) * 0.16;
    });

    // Slow group rotation
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.08) * 0.04;
    }
  });

  return (
    <group ref={group}>
      {CARDS.map((d, i) => (
        <mesh
          key={i}
          ref={el => { meshRefs.current[i] = el; }}
          position={d.pos}
          rotation={[0, d.ry, 0]}
          material={mats[i]}
        >
          <planeGeometry args={[3.4, 2.1]} />
        </mesh>
      ))}
      {/* Glowing connection lines */}
      <primitive object={new THREE.LineSegments(lineGeo, lineMat)} ref={lineRef} />
      {/* Point lights near each card */}
      {CARDS.map((d, i) => (
        <pointLight
          key={i}
          color={d.color}
          intensity={8}
          distance={4}
          decay={2}
          position={d.pos}
        />
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROAD + GROUND
// ─────────────────────────────────────────────────────────────────────────────
function Ground({ scrollRef: _scrollRef }: { scrollRef: RefObject<number> }) {
  const roadMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0e0e1c", roughness: 0.88, metalness: 0.12,
  }), []);
  const groundMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#070710", roughness: 0.95, metalness: 0.05,
  }), []);
  const lineMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffffff", emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.3,
    transparent: true, opacity: 0.7,
  }), []);

  useEffect(() => () => { roadMat.dispose(); groundMat.dispose(); lineMat.dispose(); }, [roadMat, groundMat, lineMat]);

  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -20]} material={groundMat} receiveShadow>
        <planeGeometry args={[200, 120]} />
      </mesh>
      {/* Road strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} material={roadMat} receiveShadow>
        <planeGeometry args={[6, 100]} />
      </mesh>
      {/* Road centre dashes */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 8 - i * 5.5]} material={lineMat}>
          <planeGeometry args={[0.18, 2.4]} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA RIG
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig({ scrollRef }: { scrollRef: RefObject<number> }) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(14, 6, 14));
  const look = useRef(new THREE.Vector3(0, 2, 0));

  useFrame(({ clock }) => {
    const p = scrollRef.current;
    const t = clock.getElapsedTime();

    const dT = ss(0.15, 0.42, p);
    const truckZ = lp(12, -13, dT);

    let tp: THREE.Vector3, tl: THREE.Vector3;

    if (p < 0.14) {
      // HERO: slow orbit around truck
      const ang = t * 0.22 + Math.PI * 0.18;
      const r = lp(14, 10, p / 0.14);
      tp = new THREE.Vector3(Math.sin(ang) * r, lp(7, 5, p / 0.14), Math.cos(ang) * r);
      tl = new THREE.Vector3(0, 2, 0);
    } else if (p < 0.44) {
      // DRIVE: follow from behind-left
      tp = new THREE.Vector3(-3.5, 3.0, truckZ + 10);
      tl = new THREE.Vector3(0.5, 1.6, truckZ - 4);
    } else if (p < 0.65) {
      // FUELING: arc around truck at station
      const aT = ss(0.44, 0.65, p);
      const ang = Math.PI * 0.45 + aT * Math.PI * 0.85;
      const r = 9;
      tp = new THREE.Vector3(Math.sin(ang) * r, 2.8, -13 + Math.cos(ang) * r);
      tl = new THREE.Vector3(0, 1.8, -13);
    } else if (p < 0.82) {
      // TRANSFORM / DASHBOARD EMERGE
      const tT = ss(0.65, 0.82, p);
      tp = new THREE.Vector3(lp(0, 0, tT), lp(3.5, 12, tT), lp(-6, 12, tT));
      tl = new THREE.Vector3(0, lp(2, 7, tT), lp(-13, -4, tT));
    } else {
      // FLY THROUGH DASHBOARD
      const fT = ss(0.82, 1.0, p);
      tp = new THREE.Vector3(
        Math.sin(fT * Math.PI * 0.6) * 3.5,
        lp(10, 5.5, fT),
        lp(12, 2, fT)
      );
      tl = new THREE.Vector3(
        Math.sin(fT * Math.PI * 0.4) * 1.5,
        6.5, lp(-2, -10, fT)
      );
    }

    pos.current.lerp(tp, 0.045);
    look.current.lerp(tl, 0.045);
    camera.position.copy(pos.current);
    camera.lookAt(look.current);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE LIGHTING
// ─────────────────────────────────────────────────────────────────────────────
function SceneLights({ scrollRef }: { scrollRef: RefObject<number> }) {
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const p = scrollRef.current;
    if (dirRef.current) dirRef.current.intensity = lp(1.2, 0.4, ss(0.55, 0.8, p));
    if (ambRef.current) ambRef.current.intensity = lp(0.08, 0.18, ss(0.60, 0.80, p));
  });

  return (
    <>
      <ambientLight ref={ambRef} color="#160a2a" intensity={0.08} />
      <directionalLight
        ref={dirRef}
        color="#b4a8ff"
        intensity={1.2}
        position={[-5, 12, 8]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-near={0.5}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-left={-20}
        shadow-camera-right={20}
      />
      {/* Rim light from below */}
      <pointLight color="#1e1b4b" intensity={6} distance={30} decay={2} position={[0, -3, 5]} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST-PROCESSING
// ─────────────────────────────────────────────────────────────────────────────
function PostFX() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.18}
        luminanceSmoothing={0.85}
        intensity={1.6}
        radius={0.75}
      />
      <Vignette offset={0.3} darkness={0.85} />
    </EffectComposer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INNER SCENE (runs inside Canvas context)
// ─────────────────────────────────────────────────────────────────────────────
function Scene({ scrollRef }: { scrollRef: RefObject<number> }) {
  return (
    <>
      <CameraRig scrollRef={scrollRef} />
      <SceneLights scrollRef={scrollRef} />

      {/* Background stars */}
      <Stars radius={90} depth={50} count={4000} factor={4} saturation={0.4} fade speed={0.6} />

      {/* World objects */}
      <Ground scrollRef={scrollRef} />
      <FuelTruck scrollRef={scrollRef} />
      <FuelStation scrollRef={scrollRef} />
      <FuelParticles scrollRef={scrollRef} />

      {/* 3D dashboard */}
      <DashboardCards3D scrollRef={scrollRef} />

      {/* Atmospheric particles - always present */}
      <EnergyParticles scrollRef={scrollRef} />

      {/* Post-processing */}
      <PostFX />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED CANVAS
// ─────────────────────────────────────────────────────────────────────────────
export default function CinemaCanvas() {
  const scrollRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = h > 0 ? window.scrollY / h : 0;
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <Canvas
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      dpr={[1, 1.5]}
      shadows="soft"
      camera={{ fov: 55, near: 0.1, far: 200, position: [14, 6, 14] }}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated />
        <Scene scrollRef={scrollRef} />
      </PerformanceMonitor>
    </Canvas>
  );
}
