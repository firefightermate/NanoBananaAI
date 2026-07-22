"use client";

import {
  FiEdit3,
  FiLayers,
  FiMaximize,
  FiGlobe,
  FiCreditCard,
  FiType,
} from "react-icons/fi";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import CompareSlider from "./CompareSlider";

const SMALL_FEATURES = [
  {
    icon: FiLayers,
    title: "Up to 14 references",
    body: "Feed it a face, a product, a colour board. It holds the details across every render.",
  },
  {
    icon: FiMaximize,
    title: "1K to 4K",
    body: "Twelve aspect ratios from square to 21:9, upscaled without the mush.",
  },
  {
    icon: FiGlobe,
    title: "Grounded in the web",
    body: "Flip on smart search and the model looks up what a thing actually looks like first.",
  },
  {
    icon: FiType,
    title: "Text that reads",
    body: "Posters, packaging, UI mockups — legible typography instead of alien glyphs.",
  },
  {
    icon: FiCreditCard,
    title: "Credits, not contracts",
    body: "Buy a pack, spend it whenever. Nothing renews behind your back.",
  },
];

function Card({ children, className = "", delay = 0 }) {
  return (
    <Reveal delay={delay} className={className}>
      <SpotlightCard className="h-full p-6">{children}</SpotlightCard>
    </Reveal>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <Reveal className="mb-14 max-w-2xl">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-primary">
          Why this one
        </p>
        <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          The boring parts are
          <span className="text-gradient"> already handled</span>.
        </h2>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Hero card with the compare slider */}
        <Card className="md:col-span-2 md:row-span-2">
          <div className="flex h-full flex-col gap-6">
            <div>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FiEdit3 />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                Edit by describing the change
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary-text">
                No masks, no layers, no lasso tool. Drop an image in, say
                &ldquo;make the jacket vintage leather and light it at golden
                hour,&rdquo; and everything else stays exactly where it was.
              </p>
            </div>

            <CompareSlider
              className="aspect-[16/10] w-full"
              beforeSeed="studio-flat-lighting-original"
              afterSeed="golden-hour-leather-jacket-edit"
            />
          </div>
        </Card>

        {SMALL_FEATURES.map((feature, i) => (
          <Card key={feature.title} delay={0.05 * i}>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-glass-hover text-primary">
              <feature.icon />
            </div>
            <h3 className="text-base font-bold tracking-tight">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary-text">
              {feature.body}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
