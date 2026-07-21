"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SHOWCASE } from "@/lib/showcase";
import ArtTile from "./ArtTile";
import Reveal from "@/components/ui/Reveal";

function Tile({ item }) {
  return (
    <div className="group relative aspect-[4/5] w-56 shrink-0 overflow-hidden rounded-2xl border border-glass-border sm:w-64">
      <ArtTile seed={item.prompt} src={item.src} alt={item.prompt} />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mb-2 inline-block rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary-btn-text">
          {item.tag}
        </div>
        <p className="text-[11px] leading-snug text-white/90">{item.prompt}</p>
      </div>
    </div>
  );
}

function Row({ items, reverse = false, duration = 55 }) {
  const doubled = [...items, ...items];

  return (
    <div className="marquee-pause relative flex overflow-hidden">
      <div
        className={`flex gap-4 pr-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {doubled.map((item, i) => (
          <Tile key={`${item.prompt}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function Showcase() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const half = Math.ceil(SHOWCASE.length / 2);

  return (
    <section id="showcase" ref={ref} className="relative py-24 sm:py-32">
      <div className="mx-auto mb-14 max-w-7xl px-6">
        <Reveal>
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-primary">
            Made with a sentence
          </p>
          <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            Every one of these started as
            <span className="text-gradient"> plain text</span>.
          </h2>
          <p className="mt-4 max-w-xl text-secondary-text">
            Hover any frame to read the exact prompt behind it. No seeds, no
            negative prompts, no parameter spelunking.
          </p>
        </Reveal>
      </div>

      <motion.div style={{ y }} className="space-y-4">
        <Row items={SHOWCASE.slice(0, half)} duration={62} />
        <Row items={SHOWCASE.slice(half)} reverse duration={74} />
      </motion.div>

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg-page to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg-page to-transparent sm:w-40" />
    </section>
  );
}
