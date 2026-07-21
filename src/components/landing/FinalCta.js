"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Aurora from "./Aurora";
import Reveal from "@/components/ui/Reveal";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-divider/50 py-28 sm:py-36">
      <Aurora />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[0.95] tracking-tight">
            Your first ten credits
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
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-10 inline-block"
          >
            <Link
              href="/create"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-9 py-4 text-sm font-black uppercase tracking-wider text-primary-btn-text"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
              Open the studio
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
