"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Site-wide custom cursor: a solid dot pinned to the pointer and a lagging
 * ring that spring-chases it. Desktop fine pointers only.
 *
 * Perf notes: mousemove only writes motion values (no React state, no DOM
 * queries). Hover detection rides on mouseover/mouseout, which fire on
 * target change instead of every pixel.
 */
const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, .cursor-target";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 400, damping: 28, mass: 0.45 });
  const ringY = useSpring(y, { stiffness: 400, damping: 28, mass: 0.45 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    let shown = false;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!shown) {
        shown = true;
        setVisible(true);
      }
    };
    const over = (e) => setHovering(Boolean(e.target.closest?.(INTERACTIVE)));
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => {
      shown = false;
      setVisible(false);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* dot — rides the raw motion values, zero lag */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-primary"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible ? 1 : 0, scale: pressed ? 0.6 : 1 }}
        transition={{ duration: 0.12 }}
      />
      {/* chasing ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border border-primary/60"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 42 : 24,
          height: hovering ? 42 : 24,
          opacity: visible ? (hovering ? 0.9 : 0.5) : 0,
          scale: pressed ? 0.8 : 1,
          backgroundColor: hovering
            ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
            : "rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
      />
    </>
  );
}
