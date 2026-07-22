"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Aurora from "./Aurora";
import Reveal from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";

export default function FinalCta() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const kY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);
  const kRotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-divider/50 py-28 sm:py-36"
    >
      <Aurora />

      {/* giant periodic-table K, parallax-drifting behind the copy */}
      <motion.div
        aria-hidden
        style={{ y: kY, rotate: kRotate }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
      >
        <div className="relative flex h-[26rem] w-[26rem] items-center justify-center rounded-[3rem] border border-primary/10 sm:h-[34rem] sm:w-[34rem]">
          <span className="absolute left-8 top-6 text-2xl font-black text-primary/15">
            19
          </span>
          <span
            className="text-[16rem] font-black leading-none text-transparent sm:text-[22rem]"
            style={{ WebkitTextStroke: "1.5px color-mix(in srgb, var(--color-primary) 18%, transparent)" }}
          >
            K
          </span>
          <span className="absolute bottom-8 text-[10px] font-black uppercase tracking-[0.5em] text-primary/20">
            Kalium · 39.098
          </span>
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[0.95] tracking-tight">
            Your first three renders
            <br />
            <span className="text-gradient">are already waiting.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-md text-secondary-text">
            Sign in with Google and start rendering. No card, no trial timer.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10">
            <Magnetic strength={16}>
              <Link
                href="/create"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-9 py-4 text-sm font-black uppercase tracking-wider text-primary-btn-text shadow-xl shadow-primary/30"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
                Open the studio
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
