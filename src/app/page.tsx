import { Hero } from "@/components/Hero";
import { PlanetGrid } from "@/components/PlanetGrid";
import { FeatureBelt } from "@/components/FeatureBelt";
import { StatsMarquee } from "@/components/StatsMarquee";
import { FeaturedStories } from "@/components/FeaturedStories";
import { CTABanner } from "@/components/CTABanner";
import { WhatsUp } from "@/components/WhatsUp";

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <StatsMarquee />
      <PlanetGrid />
      <FeatureBelt />
      <WhatsUp />
      <FeaturedStories />
      <CTABanner />
    </div>
  );
}
