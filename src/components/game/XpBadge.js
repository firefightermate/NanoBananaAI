"use client";

import { motion } from "framer-motion";
import { levelFromXp, levelProgress, levelTitle } from "@/lib/game";

/**
 * Player plate: level, title, animated XP bar. Sits in the studio's top-left.
 */
export default function XpBadge({ xp }) {
  const level = levelFromXp(xp);
  const progress = levelProgress(xp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-3 rounded-xl border border-glass-border bg-glass-bg px-3 py-2 backdrop-blur"
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
        <span className="text-sm font-black text-primary">{level}</span>
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-primary text-[6px] font-black text-primary-btn-text">
          LV
        </span>
      </div>
      <div className="min-w-[7rem]">
        <div className="text-[10px] font-black uppercase tracking-[0.15em]">
          {levelTitle(level)}
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-page/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--accent)]"
            initial={false}
            animate={{ width: `${Math.max(progress * 100, 4)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-secondary-text">
          {Math.round(progress * 100)}% to lv {level + 1}
        </div>
      </div>
    </motion.div>
  );
}
