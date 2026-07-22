"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import Aurora from "./Aurora";
import Molecules from "./Molecules";
import PromptDemo from "./PromptDemo";
import Magnetic from "@/components/ui/Magnetic";
import ScrambleText from "@/components/ui/ScrambleText";
import CountUp from "@/components/ui/CountUp";

const STATS = [
  { value: 4, suffix: "K", label: "Max resolution" },
  { value: 12, suffix: "", label: "Aspect ratios" },
  { value: 36, suffix: "", label: "Free credits" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Aurora />
      <Molecules />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-28">
        {/* Left column */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-[11px] font-semibold text-secondary-text backdrop-blur"
          >
            {/* mini element tile */}
            <span className="relative flex h-4.5 w-4.5 items-center justify-center rounded-[4px] bg-primary px-1 text-[9px] font-black text-primary-btn-text">
              K
            </span>
            Element 19 · running nano banana 2
          </motion.div>

          <h1 className="text-[clamp(3rem,8vw,5.75rem)] font-black leading-[0.92] tracking-tight">
            <ScrambleText text="Type it." delay={0.15} />
            <br />
            <span className="text-gradient">
              <ScrambleText text="See it." delay={0.7} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-secondary-text"
          >
            A plain sentence in, a finished image out. Generate from scratch or
            hand it up to fourteen references and describe the edit — the model
            keeps faces, products and typography intact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Magnetic strength={14}>
              <Link
                href="/create"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-btn-text shadow-lg shadow-primary/30 transition-shadow hover:shadow-primary/50"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
                Start creating free
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic strength={10}>
              <a
                href="#showcase"
                className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-6 py-3.5 text-sm font-semibold text-primary-text backdrop-blur transition-colors hover:bg-glass-hover"
              >
                <FiPlay className="text-xs" />
                See what it makes
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex gap-10"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black tracking-tight text-primary-text">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-secondary-text">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <div className="animate-floaty">
            <PromptDemo />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
