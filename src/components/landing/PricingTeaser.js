"use client";

import Link from "next/link";
import { FiCheck } from "react-icons/fi";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";

const PACKS = [
  { name: "Basic", price: "$5", credits: 500 },
  { name: "Standard", price: "$10", credits: 1000 },
  { name: "Professional", price: "$20", credits: 2000, popular: true },
  { name: "Business", price: "$50", credits: 5000 },
];

const INCLUDED = [
  "Every aspect ratio, every resolution",
  "Generate and edit from the same balance",
  "Credits never expire, nothing auto-renews",
];

export default function PricingTeaser() {
  return (
    <section id="pricing" className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <Reveal className="mb-14 text-center">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-primary">
          Pricing
        </p>
        <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          Pay for pixels, not a
          <span className="text-gradient"> seat</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-secondary-text">
          One credit is one cent. A 1K render costs 16 credits, 4K costs 32 —
          priced at 2x our raw compute cost, nothing hidden.
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PACKS.map((pack, i) => (
          <Reveal key={pack.name} delay={i * 0.06}>
            <SpotlightCard
              className={`h-full p-6 ${pack.popular ? "ring-1 ring-primary/40" : ""}`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary-btn-text">
                  Most picked
                </span>
              )}
              <h3 className="text-sm font-bold uppercase tracking-wide text-secondary-text">
                {pack.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">{pack.price}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-primary">
                {pack.credits.toLocaleString()} credits
              </div>
              <div className="mt-1 text-xs text-secondary-text">
                ≈ {Math.floor(pack.credits / 16)} images at 1K
              </div>
              <Link
                href="/pricing"
                className={`mt-6 block rounded-full py-2.5 text-center text-xs font-bold transition-colors ${
                  pack.popular
                    ? "bg-primary text-primary-btn-text hover:bg-primary-hover"
                    : "border border-glass-border bg-glass-bg text-primary-text hover:bg-glass-hover"
                }`}
              >
                Get {pack.name}
              </Link>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-secondary-text">
              <FiCheck className="text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
