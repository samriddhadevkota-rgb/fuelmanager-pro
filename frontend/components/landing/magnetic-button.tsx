"use client";
import { useRef, useEffect, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function MagneticButton({
  children,
  className,
  strength = 0.45,
  radius = 130,
  onClick,
  style,
}: MagneticButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const force = (1 - dist / radius) * strength;
        x.set(dx * force);
        y.set(dy * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const onLeave = () => { x.set(0); y.set(0); };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, strength, radius]);

  return (
    <div ref={wrapRef} style={{ display: "inline-block" }}>
      <motion.div
        style={{ x: sx, y: sy, ...style }}
        whileTap={{ scale: 0.94 }}
        className={className}
        onClick={onClick}>
        {children}
      </motion.div>
    </div>
  );
}
