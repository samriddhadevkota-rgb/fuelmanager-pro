"use client";
import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Zap, TrendingUp, Shield } from "lucide-react";

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    type Node = { x: number; y: number; vx: number; vy: number; pulse: number; size: number };
    const nodes: Node[] = [];
    const NODE_COUNT = 28;
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: 60 + Math.random() * (canvas.width - 120),
        y: 60 + Math.random() * (canvas.height - 120),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        pulse: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 3,
      });
    }

    let t = 0;
    function draw() {
      t += 0.012;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        n.pulse += 0.04;
        if (n.x < 60 || n.x > canvas!.width - 60) n.vx *= -1;
        if (n.y < 60 || n.y > canvas!.height - 60) n.vy *= -1;
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.25;
            // Signal pulse along edge
            const signal = (Math.sin(t * 3 + i * 0.5) + 1) / 2;
            const interpX = a.x + (b.x - a.x) * signal;
            const interpY = a.y + (b.y - a.y) * signal;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = "#6366f1";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Signal dot
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = "#a78bfa";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#a78bfa";
            ctx.beginPath();
            ctx.arc(interpX, interpY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const pulseSize = n.size + Math.sin(n.pulse) * 1.5;
        ctx.save();
        ctx.fillStyle = "#818cf8";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#6366f1";
        ctx.globalAlpha = 0.6 + Math.sin(n.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        // Outer ring
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseSize + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />;
}

const CAPABILITIES = [
  { icon: TrendingUp, title: "Demand Forecasting", desc: "Predict fuel demand 2 weeks ahead with 94% accuracy using historical and weather data." },
  { icon: Shield, title: "Fraud Detection", desc: "Real-time anomaly detection flags suspicious transactions and unusual consumption patterns." },
  { icon: Zap, title: "Route Optimization", desc: "AI-optimized delivery routes reduce fuel costs by 18% on average across your fleet." },
  { icon: Brain, title: "Predictive Maintenance", desc: "Know which trucks need servicing before they break down. Reduce downtime by 40%." },
];

export function AISection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 65%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Neural canvas */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[400px] rounded-2xl overflow-hidden glass-landing order-2 lg:order-1"
            style={{ boxShadow: "0 0 60px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <NeuralCanvas />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <div className="glass-landing rounded-lg px-4 py-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Processing</p>
                <p className="text-sm font-bold text-white">1,284 data streams</p>
              </div>
              <div className="glass-landing rounded-lg px-4 py-2 text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Accuracy</p>
                <p className="text-sm font-bold text-emerald-400">94.2%</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-violet-400 border border-violet-500/25 bg-violet-500/8">
                <Brain className="h-3.5 w-3.5" /> Powered by AI
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Intelligence<br /><span className="landing-gradient-text">built in.</span>
              </h2>
              <p className="text-lg text-white/40 leading-relaxed">
                FuelManager Pro doesn't just track data — it learns from it. AI models trained on millions of fuel operations work in the background, 24/7.
              </p>
            </motion.div>

            <div className="space-y-4">
              {CAPABILITIES.map((c, i) => (
                <motion.div key={c.title}
                  initial={{ opacity: 0, x: 40 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl group hover:bg-white/3 transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 group-hover:bg-indigo-500/25 transition-colors">
                    <c.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.title}</p>
                    <p className="text-[13px] text-white/40 mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
