"use client";

import { motion } from "framer-motion";

/**
 * Ambient background: slow-drifting colour fields, a masked grid, and grain.
 * Purely decorative — sits behind everything and never takes pointer events.
 */
export default function Aurora({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden grain ${className}`}
    >
      <div className="absolute inset-0 grid-bg opacity-[0.5]" />

      <motion.div
        className="absolute -top-[20%] left-[-10%] h-[60vw] w-[60vw] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-primary), transparent 65%)", opacity: 0.18 }}
        animate={{ x: [0, 80, -40, 0], y: [0, 50, 90, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[10%] right-[-15%] h-[55vw] w-[55vw] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)", opacity: 0.16 }}
        animate={{ x: [0, -70, 30, 0], y: [0, 70, -30, 0], scale: [1, 0.9, 1.12, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-25%] left-[25%] h-[50vw] w-[50vw] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, var(--accent-2), transparent 65%)", opacity: 0.12 }}
        animate={{ x: [0, 60, -60, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg-page to-transparent" />
    </div>
  );
}
