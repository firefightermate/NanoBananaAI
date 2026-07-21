"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import Reveal from "@/components/ui/Reveal";

const ITEMS = [
  {
    q: "What model is behind this?",
    a: "Google's nano banana image family, served through fal.ai. It handles both text-to-image and instruction-based editing, so generating and retouching use the same engine.",
  },
  {
    q: "How long does a render take?",
    a: "Typically well under a minute for a 1K image; 2K and 4K take longer because there is genuinely more to render. Jobs run on a queue, so you can leave the tab and come back.",
  },
  {
    q: "Do I own what I make?",
    a: "Yes. Your generations are yours to use commercially. They stay in your gallery and you can download the full-resolution file at any time.",
  },
  {
    q: "What happens if a generation fails?",
    a: "Failed jobs are marked in your gallery with the reason. If the model refuses a prompt on safety grounds, rephrase and try again.",
  },
  {
    q: "Can I use my own images?",
    a: "Up to fourteen per edit. Upload files directly or paste URLs, then describe the change you want in plain language.",
  },
];

function Item({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-divider/60">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-base font-semibold tracking-tight sm:text-lg">
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-primary"
        >
          <FiPlus />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-5 leading-relaxed text-secondary-text">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="relative mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <Reveal className="mb-10">
        <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          Questions
        </h2>
      </Reveal>

      <Reveal delay={0.1}>
        <div>
          {ITEMS.map((item, i) => (
            <Item
              key={item.q}
              item={item}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
