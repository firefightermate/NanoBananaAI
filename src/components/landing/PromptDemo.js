"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiZap } from "react-icons/fi";
import ArtTile from "./ArtTile";

const SAMPLES = [
  {
    prompt: "A liquid chrome banana orbiting a black hole, cinematic rim light",
    label: "Text to image",
  },
  {
    prompt: "Rainy Tokyo alley at midnight, neon reflections, 35mm film grain",
    label: "Text to image",
  },
  {
    prompt: "Make her jacket vintage leather and add golden hour light",
    label: "Edit",
  },
  {
    prompt: "Product shot of a matte black bottle on wet stone, studio softbox",
    label: "Text to image",
  },
];

const PHASES = { TYPING: "typing", GENERATING: "generating", RESULT: "result" };

export default function PromptDemo() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState(PHASES.TYPING);
  const timers = useRef([]);

  const sample = SAMPLES[index];

  // 3D tilt following the cursor.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 140, damping: 18 });

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    clear();
    setTyped("");
    setPhase(PHASES.TYPING);

    const text = sample.prompt;
    for (let i = 1; i <= text.length; i++) {
      timers.current.push(setTimeout(() => setTyped(text.slice(0, i)), i * 28));
    }

    const typeDone = text.length * 28;
    timers.current.push(setTimeout(() => setPhase(PHASES.GENERATING), typeDone + 500));
    timers.current.push(setTimeout(() => setPhase(PHASES.RESULT), typeDone + 2600));
    timers.current.push(
      setTimeout(() => setIndex((i) => (i + 1) % SAMPLES.length), typeDone + 7200),
    );

    return clear;
  }, [index, sample.prompt]);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="edge-card w-full max-w-md shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-glass-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary-text">
          {sample.label}
        </span>
      </div>

      <div className="space-y-4 p-4">
        {/* prompt line */}
        <div className="min-h-[68px] rounded-xl border border-glass-border bg-bg-page/60 p-3">
          <div className="text-sm leading-relaxed text-primary-text">
            {typed}
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-primary animate-blink" />
          </div>
        </div>

        {/* action row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {["1:1", "16:9", "4K"].map((chip) => (
              <span
                key={chip}
                className="rounded-md border border-glass-border bg-glass-hover px-2 py-1 text-[10px] font-semibold text-secondary-text"
              >
                {chip}
              </span>
            ))}
          </div>
          <motion.div
            animate={
              phase === PHASES.GENERATING
                ? { scale: [1, 0.96, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.6, repeat: phase === PHASES.GENERATING ? Infinity : 0 }}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-primary-btn-text"
          >
            <FiZap className="text-xs" />
            {phase === PHASES.GENERATING ? "Rendering" : "Generate"}
          </motion.div>
        </div>

        {/* canvas */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-glass-border bg-bg-page">
          <AnimatePresence mode="wait">
            {phase !== PHASES.RESULT ? (
              <motion.div
                key={`pending-${index}`}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_70%)]" />
                {phase === PHASES.GENERATING && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-primary/25 to-transparent animate-scan" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                        className="h-14 w-14 rounded-full border-2 border-glass-border border-t-primary"
                      />
                    </div>
                  </>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary-text">
                  {phase === PHASES.GENERATING ? "Diffusing pixels…" : "Awaiting prompt"}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`result-${index}`}
                initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.06 }}
                animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <ArtTile seed={sample.prompt} alt={sample.prompt} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="truncate text-[11px] font-medium text-white/90">
                    {sample.prompt}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
