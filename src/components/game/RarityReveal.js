"use client";

import { motion } from "framer-motion";

/**
 * Rarity stamp + glow ring for a finished render. Legendary gets confetti.
 */
export function RarityStamp({ rarity }) {
  return (
    <motion.div
      initial={{ scale: 2.4, opacity: 0, rotate: -12 }}
      animate={{ scale: 1, opacity: 1, rotate: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.5 }}
      className="absolute left-3 top-3 z-10 rounded-md border-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur"
      style={{
        borderColor: rarity.color,
        color: rarity.color,
        background: "rgba(0,0,0,0.55)",
        textShadow: `0 0 12px ${rarity.glow}`,
      }}
    >
      {rarity.label}
    </motion.div>
  );
}

export function RarityGlow({ rarity }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.6] }}
      transition={{ duration: 1.4, delay: 0.4 }}
      className="pointer-events-none absolute -inset-1 rounded-[1.2rem]"
      style={{ boxShadow: `0 0 60px 8px ${rarity.glow}, inset 0 0 40px -20px ${rarity.glow}` }}
    />
  );
}

const CONFETTI_COUNT = 26;

export function Confetti({ colors = ["#fbbf24", "#f59e0b", "#fde68a", "#a855f7"] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const angle = (i / CONFETTI_COUNT) * Math.PI * 2;
        const dist = 120 + (i % 5) * 40;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-1 rounded-sm"
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist + 60,
              opacity: 0,
              rotate: 180 + i * 40,
              scale: 0.6,
            }}
            transition={{ duration: 1.3 + (i % 4) * 0.2, ease: "easeOut", delay: 0.5 }}
          />
        );
      })}
    </div>
  );
}
