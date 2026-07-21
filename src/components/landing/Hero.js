"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import Aurora from "./Aurora";
import PromptDemo from "./PromptDemo";

const HEADLINE = ["Type", "it.", "See", "it."];

const STATS = [
  { value: "4K", label: "Max resolution" },
  { value: "12", label: "Aspect ratios" },
  { value: "50", label: "Free credits" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Aurora />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-28">
        {/* Left column */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-[11px] font-semibold text-secondary-text backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Running nano banana 2 · live now
          </motion.div>

          <h1 className="text-[clamp(3rem,8vw,5.75rem)] font-black leading-[0.92] tracking-tight">
            {HEADLINE.map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className={`mr-3 inline-block ${i > 1 ? "text-gradient" : ""}`}
              >
                {word}
              </motion.span>
            ))}
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
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/create"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-btn-text transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
              Start creating free
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#showcase"
              className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-6 py-3.5 text-sm font-semibold text-primary-text backdrop-blur transition-colors hover:bg-glass-hover"
            >
              <FiPlay className="text-xs" />
              See what it makes
            </a>
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
                  {stat.value}
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
