import Hero from "@/components/landing/Hero";
import Showcase from "@/components/landing/Showcase";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingTeaser from "@/components/landing/PricingTeaser";
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Showcase />
      <Features />
      <HowItWorks />
      <PricingTeaser />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
