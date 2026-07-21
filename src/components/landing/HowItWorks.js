"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Describe it",
    body: "Write it the way you'd describe it to a person. Subject, mood, lens, light — as much or as little as you like.",
  },
  {
    n: "02",
    title: "Pick the frame",
    body: "Square for social, 21:9 for a banner, 4:5 for print. Choose the resolution you actually need and spend credits accordingly.",
  },
  {
    n: "03",
    title: "Ship or refine",
    body: "Download it, or push it straight back in as a reference and describe the next change. Every version stays in your gallery.",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <Reveal className="mb-16 text-center">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-primary">
          Three steps
        </p>
        <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          From blank page to finished frame
        </h2>
      </Reveal>

      <div ref={ref} className="relative pl-12 sm:pl-20">
        {/* rail */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-divider sm:left-8" />
        <motion.div
          style={{ scaleY, originY: 0 }}
          className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary to-[var(--accent)] sm:left-8"
        />

        <div className="space-y-14">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08} direction="left">
              <div className="relative">
                <div className="absolute -left-12 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-glass-border bg-bg-card text-[11px] font-black text-primary sm:-left-20">
                  {step.n}
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-2 max-w-lg leading-relaxed text-secondary-text">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
